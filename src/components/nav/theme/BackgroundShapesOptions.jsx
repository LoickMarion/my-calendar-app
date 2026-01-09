import React from 'react';
import CaseText from '../../CaseText.jsx';

const SHAPES = ['hearts', 'circles', 'stars', 'clouds', 'triangles', 'sparkles'];

export default function BackgroundShapesOptions({ theme, setThemeVar }) {
  return (
    <>
      {SHAPES.map((s) => {
        const enabled =
          theme[`shape-${s}-enabled`] === 'true' ||
          theme[`shape-${s}-enabled`] === true;

        return (
          <div key={s} className="shape-row">
            {/* Checkbox */}
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) =>
                  setThemeVar(
                    `shape-${s}-enabled`,
                    e.target.checked ? 'true' : 'false'
                  )
                }
              />
              <span className="checkbox-custom" />
              <span className="checkbox-label-text"><CaseText>{s}</CaseText></span>
            </label>

            {/* Color picker (right-aligned via CSS) */}
            <input
              type="color"
              className="color-picker"
              value={theme[`shape-${s}-color`] || '#000000'}
              onChange={(e) =>
                setThemeVar(`shape-${s}-color`, e.target.value)
              }
            />

            {/* Sliders only when enabled */}
            {enabled && (
              <div className="shape-sliders-row">
                {/* Density (quadratic mapping happens elsewhere) */}
                <label className="advanced-label slider-label">
                  <span><CaseText>Density</CaseText></span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={theme[`shape-${s}-density`] || 0}
                    onChange={(e) =>
                      setThemeVar(
                        `shape-${s}-density`,
                        String(e.target.value)
                      )
                    }
                  />
                </label>

                {/* Opacity */}
                <label className="advanced-label slider-label">
                  <span><CaseText>Opacity</CaseText></span>
                  <input
                    type="range"
                    min={0.02}
                    max={1}
                    step={0.02}
                    value={Number(theme[`shape-${s}-opacity`] || 0.18)}
                    onChange={(e) =>
                      setThemeVar(
                        `shape-${s}-opacity`,
                        String(e.target.value)
                      )
                    }
                  />
                </label>

                {/* Size */}
                <label className="advanced-label slider-label">
                  <span><CaseText>Size</CaseText></span>
                  <input
                    type="range"
                    min={25}
                    max={200}
                    value={Math.round(
                      Number(theme[`shape-${s}-size`] || 1) * 100
                    )}
                    onChange={(e) =>
                      setThemeVar(
                        `shape-${s}-size`,
                        String(Number(e.target.value) / 100)
                      )
                    }
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}

      {/* Global shape controls */}
      <div className="shape-settings-row controls-row">
        <div className="control-item">
          <label className="control-label"><CaseText>Render on top of widgets</CaseText></label>
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={
                theme['shapes-on-top'] === 'true' ||
                theme['shapes-on-top'] === true
              }
              onChange={(e) =>
                setThemeVar(
                  'shapes-on-top',
                  e.target.checked ? 'true' : 'false'
                )
              }
            />
            <span className="checkbox-custom" />
          </label>
        </div>

        <div className="control-item">
          <label className="control-label"><CaseText>Random Seed</CaseText></label>
          <input
            type="text"
            className="control-input"
            placeholder="Optional"
            value={theme['shapes-seed'] || ''}
            onChange={(e) =>
              setThemeVar('shapes-seed', e.target.value)
            }
          />
        </div>
      </div>
    </>
  );
}
