import React from 'react';

export default function AdvancedOptions({ theme, setThemeVar }) {
  const shapes = ['hearts', 'circles', 'stars', 'clouds', 'triangles', 'sparkles'];

  return (
    <details className="theme-advanced-options">
      <summary className="advanced-summary">Advanced Options</summary>

      {/* Background Shapes Section */}
      <div className="advanced-section">
        <div className="advanced-section-title">Background Shapes</div>
        <div className="advanced-subsection">

          {/* Shape checkboxes + color pickers */}
          {shapes.map((s) => (
            <label key={s} className="advanced-label">
              <div className="advanced-label-left">
                <input
                  type="checkbox"
                  checked={theme[`shape-${s}-enabled`] === 'true' || theme[`shape-${s}-enabled`] === true}
                  onChange={(e) =>
                    setThemeVar(`shape-${s}-enabled`, e.target.checked ? 'true' : 'false')
                  }
                />
                <span className="advanced-label-text">{s}</span>
              </div>
              <input
                type="color"
                value={theme[`shape-${s}-color`] || '#000000'}
                onChange={(e) => setThemeVar(`shape-${s}-color`, e.target.value)}
              />
            </label>
          ))}

          {/* Density slider */}
          <label className="advanced-label slider-label">
            <span>Density</span>
            <input
              type="range"
              min={4}
              max={60}
              value={theme['shapes-density'] || 18}
              onChange={(e) => setThemeVar('shapes-density', String(e.target.value))}
            />
          </label>

          {/* Opacity / size / other sliders */}
          <div className="advanced-slider-group">
            <label className="advanced-label slider-label">
              <span>Opacity</span>
              <input
                type="range"
                min={0.02}
                max={0.6}
                step={0.02}
                value={Number(theme['shapes-opacity'] || 0.18)}
                onChange={(e) => setThemeVar('shapes-opacity', String(e.target.value))}
              />
            </label>

            <label className="advanced-label slider-label">
              <span>Size multiplier</span>
              <input
                type="range"
                min={50}
                max={300}
                value={Math.round(Number(theme['shapes-size'] || 1.0) * 100)}
                onChange={(e) => setThemeVar('shapes-size', String(Number(e.target.value) / 100))}
              />
            </label>

            <label className="advanced-label slider-label">
              <span>Render on top of widgets</span>
              <input
                type="checkbox"
                checked={theme['shapes-on-top'] === 'true' || theme['shapes-on-top'] === true}
                onChange={(e) => setThemeVar('shapes-on-top', e.target.checked ? 'true' : 'false')}
              />
            </label>

            <label className="advanced-label slider-label">
              <span>Random seed (optional)</span>
              <input
                type="text"
                value={theme['shapes-seed'] || ''}
                onChange={(e) => setThemeVar('shapes-seed', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Future Sections */}
      <div className="advanced-section">
        <div className="advanced-section-title">Bullet Points</div>
        <div className="advanced-subsection">{/* TODO */}</div>
      </div>

      <div className="advanced-section">
        <div className="advanced-section-title">Animations</div>
        <div className="advanced-subsection">{/* TODO */}</div>
      </div>
    </details>
  );
}
