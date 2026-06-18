export default function Toolbar({
  mode, onModeChange,
  onUpload, onRemoveUnderlay,
  onDeleteSelected, selectedId,
  onClear,
  underlayOpacity, onUnderlayOpacityChange, hasUnderlay,
  zoom, onResetZoom,
  wallThickness, onWallThicknessChange,
  selectedWall, onSelectedWallThicknessChange,
  activeLayerId, layers,
}) {
  const activeLayer = layers?.find(l => l.id === activeLayerId);
  return (
    <div className="toolbar">
      <span className="toolbar-title">HDB Designer</span>
      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <button
          className={`btn ${mode === 'select' ? 'active' : ''}`}
          onClick={() => onModeChange('select')}
          title="Select / Move (V)"
        >
          Select
        </button>
        <button
          className={`btn ${mode === 'draw-wall' ? 'active' : ''}`}
          onClick={() => onModeChange('draw-wall')}
          title="Draw Wall (W)"
        >
          Draw Wall
        </button>
      </div>

      <div className="toolbar-sep" />

      {/* Wall thickness — shows selected wall's value when one is selected, else default */}
      <div className="toolbar-group" style={{ gap: 6 }}>
        <label>Wall thickness</label>
        <input
          type="number"
          min="1" max="200"
          value={selectedWall ? (selectedWall.thickness ?? 12) : wallThickness}
          onChange={(e) => {
            const v = Math.max(1, parseInt(e.target.value) || 1);
            if (selectedWall) onSelectedWallThicknessChange(v);
            else onWallThicknessChange(v);
          }}
          style={{ width: 52, padding: '4px 6px', background: '#0f0f23', border: '1px solid #3a3a5a', borderRadius: 4, color: '#e0e0e0' }}
        />
        <span style={{ fontSize: 11, color: '#666' }}>px{selectedWall ? ' (selected)' : ' (default)'}</span>
      </div>

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <div className="btn upload-btn">
          {hasUnderlay ? 'Replace Floor Plan' : 'Upload Floor Plan'}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0]); e.target.value = ''; }}
          />
        </div>
        {hasUnderlay && (
          <button className="btn danger" onClick={onRemoveUnderlay} title="Remove floor plan image">
            Remove
          </button>
        )}
      </div>

      {hasUnderlay && (
        <>
          <div className="toolbar-sep" />
          <div className="toolbar-group" style={{ gap: 6 }}>
            <label>Floor plan opacity</label>
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={underlayOpacity}
              onChange={(e) => onUnderlayOpacityChange(parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <button
          className="btn"
          onClick={onResetZoom}
          title="Reset zoom to fit"
        >
          Fit View
        </button>
        <span style={{ fontSize: 11, color: '#666' }}>{Math.round(zoom * 100)}%</span>
      </div>

      <div style={{ flex: 1 }} />

      {activeLayer && (
        <div className="toolbar-group" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, color: '#888' }}>Active layer:</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: activeLayer.color,
              background: 'rgba(255,255,255,0.07)',
              padding: '3px 8px',
              borderRadius: 4,
              border: `1px solid ${activeLayer.color}44`,
            }}
          >
            {activeLayer.name}
          </span>
        </div>
      )}

      <div className="toolbar-sep" />

      {selectedId && (
        <button className="btn danger" onClick={onDeleteSelected}>
          Delete Selected
        </button>
      )}
      <button className="btn" style={{ color: '#f87171' }} onClick={onClear}>
        Clear All
      </button>
    </div>
  );
}
