import { useState, useCallback, useEffect, useRef } from 'react';
import Toolbar from './components/Toolbar';
import FurnitureCatalog from './components/FurnitureCatalog';
import DesignerCanvas from './components/DesignerCanvas';
import LayersPanel, { INITIAL_LAYERS } from './components/LayersPanel';
import { SCALE } from './data/furniture';
import './App.css';

const STORAGE_KEY = 'hdb-designer-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { walls: s.walls ?? [], furniture: s.furniture ?? [], layers: s.layers ?? null };
    }
  } catch {}
  return { walls: [], furniture: [], layers: null };
}

export default function App() {
  const saved = loadState();
  const [mode, setMode] = useState('select');
  const [walls, setWalls] = useState(saved.walls);
  const [furniture, setFurniture] = useState(saved.furniture);
  const [layers, setLayers] = useState(saved.layers ?? INITIAL_LAYERS);
  const [activeLayerId, setActiveLayerId] = useState('modification');
  const [underlay, setUnderlay] = useState(null);
  const [underlayOpacity, setUnderlayOpacity] = useState(0.4);
  const [selectedId, setSelectedId] = useState(null);
  const [defaultWallThickness, setDefaultWallThickness] = useState(12);
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 40, y: 40 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const canvasAreaRef = useRef(null);

  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    obs.observe(el);
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ walls, furniture, layers }));
    } catch {}
  }, [walls, furniture, layers]);

  const handleUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUnderlay({ dataUrl: e.target.result, x: 0, y: 0, scaleX: 1, scaleY: 1 });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveUnderlay = useCallback(() => setUnderlay(null), []);

  const handleUnderlayLoaded = useCallback((naturalW) => {
    const targetW = containerSize.width * 0.8 / zoom;
    const s = targetW / naturalW;
    setUnderlay(prev => prev ? { ...prev, scaleX: s, scaleY: s } : prev);
  }, [containerSize.width, zoom]);

  const addFurniture = useCallback((item, x, y, layerId) => {
    const w = Math.round(item.w * SCALE);
    const h = Math.round(item.h * SCALE);
    setFurniture(prev => [...prev, {
      id: crypto.randomUUID(),
      type: item.type,
      name: item.name,
      x: x - w / 2,
      y: y - h / 2,
      width: w,
      height: h,
      rotation: 0,
      color: item.color,
      shape: item.shape ?? 'rect',
      layerId: layerId ?? activeLayerId,
    }]);
  }, [activeLayerId]);

  const addToCenter = useCallback((item) => {
    const cx = (containerSize.width / 2 - stagePos.x) / zoom;
    const cy = (containerSize.height / 2 - stagePos.y) / zoom;
    addFurniture(item, cx, cy);
  }, [addFurniture, containerSize, stagePos, zoom]);

  const updateFurniture = useCallback((id, changes) => {
    if (changes === null) {
      setFurniture(prev => prev.filter(f => f.id !== id));
      setSelectedId(prev => prev === id ? null : prev);
    } else {
      setFurniture(prev => prev.map(f => f.id === id ? { ...f, ...changes } : f));
    }
  }, []);

  const addWall = useCallback((wall) => {
    setWalls(prev => [...prev, { ...wall, layerId: activeLayerId }]);
  }, [activeLayerId]);

  const updateWall = useCallback((id, changes) => {
    setWalls(prev => prev.map(w => w.id === id ? { ...w, ...changes } : w));
  }, []);

  const deleteWall = useCallback((id) => {
    setWalls(prev => prev.filter(w => w.id !== id));
    setSelectedId(prev => prev === id ? null : prev);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    const isWall = walls.some(w => w.id === selectedId);
    if (isWall) deleteWall(selectedId);
    else updateFurniture(selectedId, null);
    setSelectedId(null);
  }, [selectedId, walls, deleteWall, updateFurniture]);

  const handleClear = useCallback(() => {
    if (!confirm('Clear all walls and furniture?')) return;
    setWalls([]);
    setFurniture([]);
    setSelectedId(null);
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setStagePos({ x: 40, y: 40 });
  }, []);

  const handleToggleLayerVisible = useCallback((id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  }, []);

  const handleToggleLayerLocked = useCallback((id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  }, []);

  const selectedWall = walls.find(w => w.id === selectedId) ?? null;

  const handleSelectedWallThicknessChange = useCallback((v) => {
    if (selectedId) updateWall(selectedId, { thickness: v });
  }, [selectedId, updateWall]);

  return (
    <div className="app">
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        onUpload={handleUpload}
        onRemoveUnderlay={handleRemoveUnderlay}
        onDeleteSelected={handleDeleteSelected}
        selectedId={selectedId}
        onClear={handleClear}
        hasUnderlay={!!underlay}
        underlayOpacity={underlayOpacity}
        onUnderlayOpacityChange={setUnderlayOpacity}
        zoom={zoom}
        onResetZoom={handleResetZoom}
        wallThickness={defaultWallThickness}
        onWallThicknessChange={setDefaultWallThickness}
        selectedWall={selectedWall}
        onSelectedWallThicknessChange={handleSelectedWallThicknessChange}
        activeLayerId={activeLayerId}
        layers={layers}
      />
      <div className="app-body">
        <FurnitureCatalog onAddToCenter={addToCenter} />
        <div ref={canvasAreaRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <DesignerCanvas
            mode={mode}
            onModeChange={setMode}
            walls={walls}
            furniture={furniture}
            layers={layers}
            underlay={underlay}
            underlayOpacity={underlayOpacity}
            selectedId={selectedId}
            onSelectId={setSelectedId}
            onAddWall={addWall}
            onUpdateWall={updateWall}
            onDeleteWall={deleteWall}
            onUpdateFurniture={updateFurniture}
            onAddFurniture={addFurniture}
            onUnderlayLoaded={handleUnderlayLoaded}
            zoom={zoom}
            onZoomChange={setZoom}
            stagePos={stagePos}
            onStagePosChange={setStagePos}
            containerSize={containerSize}
            defaultWallThickness={defaultWallThickness}
            activeLayerId={activeLayerId}
          />
        </div>
        <LayersPanel
          layers={layers}
          activeLayerId={activeLayerId}
          onSetActive={setActiveLayerId}
          onToggleVisible={handleToggleLayerVisible}
          onToggleLocked={handleToggleLayerLocked}
        />
      </div>
      <div className="statusbar">
        <span>Mode: <b>{mode === 'draw-wall' ? 'Draw Wall — click to start, click again to finish' : 'Select — drag to move, scroll to zoom'}</b></span>
        <span>Active layer: <b>{layers.find(l => l.id === activeLayerId)?.name}</b></span>
        <span>Walls: {walls.length}</span>
        <span>Furniture: {furniture.length}</span>
        <span style={{ marginLeft: 'auto' }}>V = Select · W = Draw Wall · Delete = remove selected · Dbl-click wall label to edit</span>
      </div>
    </div>
  );
}
