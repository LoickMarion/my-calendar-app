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

          {/* Sliders row: Density / Opacity / Size */}
          <div className="shape-settings-row">
            {/* Density */}
            <label className="advanced-label slider-label">
              <span>Density</span>
              <input
                type="range"
                min={4}
                max={200}  // increased max
                value={theme['shapes-density'] || 18}
                onChange={(e) => setThemeVar('shapes-density', String(e.target.value))}
              />
            </label>

            {/* Opacity */}
            <label className="advanced-label slider-label">
              <span>Opacity</span>
              <input
                type="range"
                min={0.02}
                max={1.0}
                step={0.02}
                value={Number(theme['shapes-opacity'] || 0.18)}
                onChange={(e) => setThemeVar('shapes-opacity', String(e.target.value))}
              />
            </label>

            {/* Size multiplier */}
            <label className="advanced-label slider-label">
              <span>Size</span>
              <input
                type="range"
                min={25}
                max={200}
                value={Math.round(Number(theme['shapes-size'] || 1.0) * 100)}
                onChange={(e) => setThemeVar('shapes-size', String(Number(e.target.value) / 100))}
              />
            </label>
          </div>

          {/* Other options row */}
          <div className="shape-settings-row controls-row">
            {/* Render on top checkbox */}
            <div className="control-item">
              <label className="control-label">Render on top of widgets</label>
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={theme['shapes-on-top'] === 'true' || theme['shapes-on-top'] === true}
                  onChange={(e) => setThemeVar('shapes-on-top', e.target.checked ? 'true' : 'false')}
                />
                <span className="checkbox-custom" />
              </label>
            </div>

            {/* Random seed input */}
            <div className="control-item">
              <label className="control-label">Random seed</label>
              <input
                type="text"
                value={theme['shapes-seed'] || ''}
                onChange={(e) => setThemeVar('shapes-seed', e.target.value)}
                className="control-input"
                placeholder="Optional"
              />
            </div>
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
