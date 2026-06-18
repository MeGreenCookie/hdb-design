import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Stage, Layer, Image as KonvaImage,
  Line, Text, Rect, Ellipse, Group, Transformer,
} from 'react-konva';

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 4;

function getCanvasPos(stage) {
  const pos = stage.getPointerPosition();
  const scale = stage.scaleX();
  const stagePos = stage.position();
  return {
    x: (pos.x - stagePos.x) / scale,
    y: (pos.y - stagePos.y) / scale,
  };
}

function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export default function DesignerCanvas({
  mode, onModeChange,
  walls, furniture,
  layers,
  underlay, underlayOpacity,
  selectedId, onSelectId,
  onAddWall, onUpdateWall, onDeleteWall,
  onUpdateFurniture, onAddFurniture,
  onUnderlayLoaded,
  zoom, onZoomChange,
  stagePos, onStagePosChange,
  containerSize,
  defaultWallThickness,
  activeLayerId,
}) {
  const layerMap = Object.fromEntries((layers ?? []).map(l => [l.id, l]));
  const isLayerVisible = (layerId) => layerMap[layerId ?? 'base']?.visible !== false;
  const isLayerLocked  = (layerId) => layerMap[layerId ?? 'base']?.locked === true;
  const layerWallColor = (layerId) => layerMap[layerId ?? 'base']?.wallColor ?? '#d1d5db';
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const [underlayImg, setUnderlayImg] = useState(null);

  // Wall drawing state
  const [drawStart, setDrawStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Wall label modal
  const [pendingWall, setPendingWall] = useState(null);
  const [labelInput, setLabelInput] = useState('');
  const labelInputRef = useRef(null);

  // Load underlay image
  useEffect(() => {
    if (!underlay?.dataUrl) { setUnderlayImg(null); return; }
    const img = new window.Image();
    img.onload = () => {
      setUnderlayImg(img);
      onUnderlayLoaded && onUnderlayLoaded(img.naturalWidth, img.naturalHeight);
    };
    img.src = underlay.dataUrl;
  }, [underlay?.dataUrl]);

  // Attach transformer to selected furniture
  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const isFurniture = furniture.some(f => f.id === selectedId);
    if (isFurniture) {
      const node = stage.findOne(`#${selectedId}`);
      if (node) { tr.nodes([node]); tr.getLayer().batchDraw(); return; }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, furniture]);

  // Keyboard delete
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') &&
          e.target.tagName !== 'INPUT' && selectedId) {
        const wall = walls.find(w => w.id === selectedId);
        const furn = furniture.find(f => f.id === selectedId);
        const itemLayerId = wall?.layerId ?? furn?.layerId;
        if (itemLayerId !== activeLayerId) return;
        if (wall) onDeleteWall(selectedId);
        else onUpdateFurniture(selectedId, null);
        onSelectId(null);
      }
      if (e.key === 'v' || e.key === 'V') onModeChange('select');
      if (e.key === 'w' || e.key === 'W') onModeChange('draw-wall');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, walls, furniture, activeLayerId, onDeleteWall, onUpdateFurniture, onSelectId, onModeChange]);

  // Overlap set
  const overlapping = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < furniture.length; i++) {
      for (let j = i + 1; j < furniture.length; j++) {
        if (aabbOverlap(furniture[i], furniture[j])) {
          set.add(furniture[i].id);
          set.add(furniture[j].id);
        }
      }
    }
    return set;
  }, [furniture]);

  // Zoom with wheel
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.12;
    const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM,
      e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
    ));
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    onZoomChange(newScale);
    onStagePosChange(newPos);
  }, [onZoomChange, onStagePosChange]);

  const handleStageMouseMove = useCallback((e) => {
    if (mode === 'draw-wall') {
      setMousePos(getCanvasPos(e.target.getStage()));
    }
  }, [mode]);

  const handleStageClick = useCallback((e) => {
    if (e.target !== e.target.getStage()) return; // clicked a shape, not empty space
    if (mode === 'select') {
      onSelectId(null);
      return;
    }
    if (mode === 'draw-wall') {
      const pos = getCanvasPos(e.target.getStage());
      if (!drawStart) {
        setDrawStart(pos);
        setMousePos(pos);
      } else {
        const wall = {
          id: crypto.randomUUID(),
          x1: drawStart.x, y1: drawStart.y,
          x2: pos.x, y2: pos.y,
          label: '',
          thickness: defaultWallThickness ?? 12,
        };
        onAddWall(wall);
        setPendingWall(wall.id);
        setLabelInput('');
        setDrawStart(null);
      }
    }
  }, [mode, drawStart, onAddWall, onSelectId]);

  const handleWallDragEnd = useCallback((wall, e) => {
    const dx = e.target.x() - wall.x1;
    const dy = e.target.y() - wall.y1;
    onUpdateWall(wall.id, {
      x1: wall.x1 + dx,
      y1: wall.y1 + dy,
      x2: wall.x2 + dx,
      y2: wall.y2 + dy,
    });
  }, [onUpdateWall]);

  const handleFurnitureDragEnd = useCallback((id, e) => {
    onUpdateFurniture(id, { x: e.target.x(), y: e.target.y() });
  }, [onUpdateFurniture]);

  const handleTransformEnd = useCallback((id, e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const item = furniture.find(f => f.id === id);
    if (!item) return;
    onUpdateFurniture(id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, item.width * scaleX),
      height: Math.max(10, item.height * scaleY),
      rotation: node.rotation(),
    });
  }, [furniture, onUpdateFurniture]);

  const handleWallLabelConfirm = () => {
    if (pendingWall) onUpdateWall(pendingWall, { label: labelInput });
    setPendingWall(null);
  };

  // Focus label input when modal opens
  useEffect(() => {
    if (pendingWall && labelInputRef.current) {
      setTimeout(() => labelInputRef.current?.focus(), 50);
    }
  }, [pendingWall]);

  const strokeW = 1 / zoom;

  return (
    <div
      style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#0f0f23' }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData('furniture');
        if (!raw) return;
        const item = JSON.parse(raw);
        const stage = stageRef.current;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - stage.x()) / stage.scaleX();
        const y = (e.clientY - rect.top - stage.y()) / stage.scaleY();
        onAddFurniture(item, x, y);
      }}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        draggable={mode === 'select' && !selectedId}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            onStagePosChange({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseMove={handleStageMouseMove}
        style={{ cursor: mode === 'draw-wall' ? 'crosshair' : 'default' }}
      >
        {/* Underlay layer */}
        <Layer>
          {underlayImg && underlay && (
            <KonvaImage
              image={underlayImg}
              x={underlay.x ?? 0}
              y={underlay.y ?? 0}
              scaleX={underlay.scaleX ?? 1}
              scaleY={underlay.scaleY ?? 1}
              opacity={underlayOpacity ?? 0.4}
              listening={false}
            />
          )}
        </Layer>

        {/* Main layer: walls + furniture */}
        <Layer>
          {/* Walls */}
          {walls.filter(w => isLayerVisible(w.layerId)).map((wall) => {
            const dx = wall.x2 - wall.x1;
            const dy = wall.y2 - wall.y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const thickness = wall.thickness ?? 12;
            const mx = (wall.x1 + wall.x2) / 2;
            const my = (wall.y1 + wall.y2) / 2;
            const isSelected = selectedId === wall.id;
            const locked = isLayerLocked(wall.layerId);
            const inactive = wall.layerId !== activeLayerId;
            const baseColor = layerWallColor(wall.layerId);
            return (
              <Group key={wall.id}>
                <Rect
                  id={wall.id}
                  x={wall.x1}
                  y={wall.y1}
                  width={length}
                  height={thickness}
                  offsetY={thickness / 2}
                  rotation={angle}
                  fill={isSelected ? '#3b82f6' : baseColor}
                  stroke={isSelected ? '#1d4ed8' : 'rgba(0,0,0,0.35)'}
                  strokeWidth={strokeW}
                  opacity={locked || inactive ? 0.5 : 1}
                  draggable={mode === 'select' && !locked && !inactive}
                  onDragStart={(e) => { e.cancelBubble = true; onSelectId(wall.id); }}
                  onDragEnd={(e) => handleWallDragEnd(wall, e)}
                  onClick={locked || inactive ? undefined : (e) => { e.cancelBubble = true; onSelectId(wall.id); }}
                  onDblClick={locked || inactive ? undefined : (e) => {
                    e.cancelBubble = true;
                    const current = walls.find(w => w.id === wall.id);
                    setPendingWall(wall.id);
                    setLabelInput(current?.label ?? '');
                  }}
                />
                {wall.label ? (
                  <Text
                    x={mx}
                    y={my}
                    text={wall.label}
                    fontSize={11 * strokeW}
                    fill={isSelected ? '#93c5fd' : '#facc15'}
                    rotation={Math.abs(angle) > 90 ? angle + 180 : angle}
                    offsetX={wall.label.length * 3 * strokeW}
                    offsetY={(thickness / 2 + 4) * strokeW}
                    listening={false}
                  />
                ) : null}
              </Group>
            );
          })}

          {/* Drawing preview */}
          {mode === 'draw-wall' && drawStart && (() => {
            const dx = mousePos.x - drawStart.x;
            const dy = mousePos.y - drawStart.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const t = defaultWallThickness ?? 12;
            return (
              <Rect
                x={drawStart.x}
                y={drawStart.y}
                width={length}
                height={t}
                offsetY={t / 2}
                rotation={angle}
                fill="rgba(59,130,246,0.35)"
                stroke="#2563eb"
                strokeWidth={strokeW}
                dash={[8 * strokeW, 4 * strokeW]}
                listening={false}
              />
            );
          })()}

          {/* Furniture */}
          {furniture.filter(f => isLayerVisible(f.layerId)).map((item) => {
            const isOverlap = overlapping.has(item.id);
            const isSelected = selectedId === item.id;
            const locked = isLayerLocked(item.layerId);
            const inactive = item.layerId !== activeLayerId;
            const fontSize = Math.max(6, Math.min(13, item.width * 0.09)) * strokeW;
            return (
              <Group
                key={item.id}
                id={item.id}
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation ?? 0}
                draggable={mode === 'select' && !locked && !inactive}
                opacity={locked || inactive ? 0.5 : 1}
                onClick={locked || inactive ? undefined : (e) => { e.cancelBubble = true; onSelectId(item.id); }}
                onDragEnd={(e) => handleFurnitureDragEnd(item.id, e)}
                onTransformEnd={(e) => handleTransformEnd(item.id, e)}
              >
                {item.shape === 'ellipse' ? (
                  <Ellipse
                    x={item.width / 2}
                    y={item.height / 2}
                    radiusX={item.width / 2}
                    radiusY={item.height / 2}
                    fill={item.color}
                    stroke={isOverlap ? '#ef4444' : isSelected ? '#2563eb' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={(isOverlap ? 3 : isSelected ? 2 : 1) * strokeW}
                    opacity={0.88}
                  />
                ) : (
                  <Rect
                    width={item.width}
                    height={item.height}
                    fill={item.color}
                    stroke={isOverlap ? '#ef4444' : isSelected ? '#2563eb' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={(isOverlap ? 3 : isSelected ? 2 : 1) * strokeW}
                    cornerRadius={2}
                    opacity={0.88}
                  />
                )}
                <Text
                  text={item.name}
                  width={item.width}
                  height={item.height}
                  align="center"
                  verticalAlign="middle"
                  fontSize={fontSize}
                  fill="rgba(0,0,0,0.85)"
                  fontStyle="bold"
                  wrap="word"
                  ellipsis
                  listening={false}
                />
              </Group>
            );
          })}

          {/* Transformer */}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            keepRatio={false}
            enabledAnchors={['top-left','top-right','bottom-left','bottom-right','middle-left','middle-right','top-center','bottom-center']}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
            }
          />
        </Layer>
      </Stage>

      {/* Wall label modal */}
      {pendingWall && (
        <div className="modal-overlay" onClick={() => setPendingWall(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Wall Measurement Label</h3>
            <p className="modal-hint">Enter the real-world dimension of this wall (e.g. 2800mm, 3.5m)</p>
            <input
              ref={labelInputRef}
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="e.g. 2800mm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleWallLabelConfirm();
                if (e.key === 'Escape') setPendingWall(null);
              }}
            />
            <div className="modal-actions">
              <button className="btn" onClick={() => setPendingWall(null)}>Cancel</button>
              <button className="btn active" onClick={handleWallLabelConfirm}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
