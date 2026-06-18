import { useState } from 'react';
import { FURNITURE_CATEGORIES, SCALE } from '../data/furniture';

export default function FurnitureCatalog({ onAddToCenter }) {
  const [collapsed, setCollapsed] = useState({});

  const toggle = (name) => setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="sidebar">
      <div className="sidebar-header">Furniture</div>
      <div className="sidebar-scroll">
        {FURNITURE_CATEGORIES.map((cat) => (
          <div key={cat.name} className="catalog-category">
            <div
              className="catalog-category-header"
              onClick={() => toggle(cat.name)}
            >
              <span>{cat.name}</span>
              <span>{collapsed[cat.name] ? '▸' : '▾'}</span>
            </div>
            {!collapsed[cat.name] && (
              <div className="catalog-items">
                {cat.items.map((item) => (
                  <div
                    key={item.type}
                    className="catalog-item"
                    draggable
                    title={`${item.w}×${item.h}mm — drag to canvas or click to add`}
                    onClick={() => onAddToCenter(item)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('furniture', JSON.stringify(item));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <span
                      className="catalog-item-swatch"
                      style={{ background: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
