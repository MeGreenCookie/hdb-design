export const INITIAL_LAYERS = [
  { id: 'base',         name: 'Base',          color: '#94a3b8', wallColor: '#d1d5db', visible: true, locked: false },
  { id: 'modification', name: 'Modifications',  color: '#f59e0b', wallColor: '#fcd34d', visible: true, locked: false },
];

export default function LayersPanel({ layers, activeLayerId, onSetActive, onToggleVisible, onToggleLocked }) {
  return (
    <div className="layers-panel">
      <div className="sidebar-header">Layers</div>
      <div className="layers-list">
        {[...layers].reverse().map((layer) => {
          const isActive = activeLayerId === layer.id;
          return (
            <div
              key={layer.id}
              className={`layer-row${isActive ? ' layer-row-active' : ''}${!layer.visible ? ' layer-row-hidden' : ''}`}
              onClick={() => onSetActive(layer.id)}
              title="Click to make active"
            >
              <span className="layer-active-indicator">{isActive ? '◉' : '◎'}</span>
              <span className="layer-swatch" style={{ background: layer.color }} />
              <span className="layer-name">{layer.name}</span>
              <span className="layer-controls" onClick={(e) => e.stopPropagation()}>
                <button
                  className={`layer-icon-btn${layer.visible ? '' : ' layer-icon-off'}`}
                  onClick={() => onToggleVisible(layer.id)}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? 'V' : 'H'}
                </button>
                <button
                  className={`layer-icon-btn${layer.locked ? ' layer-icon-locked' : ''}`}
                  onClick={() => onToggleLocked(layer.id)}
                  title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  {layer.locked ? 'Lk' : 'Fr'}
                </button>
              </span>
            </div>
          );
        })}
      </div>
      <div className="layers-hint">
        Active layer receives new walls and furniture.
        Hidden layers are invisible. Locked layers cannot be selected or moved.
      </div>
    </div>
  );
}
