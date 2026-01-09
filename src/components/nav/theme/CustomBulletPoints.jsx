// src/components/CustomBulletPoints.jsx
import React from 'react';
import { SVG_BULLETS } from './CustomBulletPointsSVGs';

// Editable simple shapes
const SIMPLE_SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'heart', label: 'Heart' },
  { id: 'star', label: 'Star' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'arrow', label: 'Arrow' },
];

export default function CustomBulletPoints({ theme, setThemeVar }) {
  const selectedSVG = theme['bullet-svg'] || 'brain';
  const selectedShape = theme['bullet-shape'] || 'circle';

  return (
    <div className="advanced-section">
      <div className="advanced-section-title">Custom Bullet Points</div>

      <div className="advanced-subsection">
        {/* ======================= SVG Bullets ======================= */}
        <div className="bullet-section">
          <div className="bullet-section-title">SVG Icons</div>
          <div className="bullet-style-grid">
            {Object.entries(SVG_BULLETS).map(([id, Svg]) => (
              <button
                key={id}
                type="button"
                className={`btn bullet-style-option ${selectedSVG === id ? 'active' : ''}`}
                onClick={() => setThemeVar('bullet-svg', id)}
              >
                
                <span className="bullet-label">{id}</span>
              </button>
            ))}
          </div>

          <div className="bullet-controls">
            <label className="advanced-label slider-label">
              <span>Size</span>
              <input
                type="range"
                min={10}
                max={200}
                value={theme['bullet-svg-size'] || 24}
                onChange={(e) => setThemeVar('bullet-svg-size', Number(e.target.value))}
              />
            </label>

            <label className="advanced-label slider-label">
              <span>Spacing</span>
              <input
                type="range"
                min={0}
                max={50}
                value={theme['bullet-svg-spacing'] || 6}
                onChange={(e) => setThemeVar('bullet-svg-spacing', Number(e.target.value))}
              />
            </label>

          </div>
        </div>

      </div>
    </div>
  );
}
