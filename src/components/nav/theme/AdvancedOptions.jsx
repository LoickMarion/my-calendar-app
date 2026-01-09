import React from 'react';
import BackgroundShapesOptions from './BackgroundShapesOptions';
import CustomBulletPoints from './CustomBulletPoints';

export default function AdvancedOptions({ theme, setThemeVar }) {
  return (
    <details className="theme-advanced-options">
      <summary className="advanced-summary">Advanced Options</summary>

      {/* Background Shapes */}
      <div className="advanced-section">
        <div className="advanced-section-title">Background Shapes</div>
        <div className="advanced-subsection">
          <BackgroundShapesOptions
            theme={theme}
            setThemeVar={setThemeVar}
          />
        </div>
      </div>

      {/* Bullet Points (future) */}
          <div className="advanced-section">
        <div className="advanced-subsection">
          <CustomBulletPoints
            theme={theme}
            setThemeVar={setThemeVar}
          />
        </div>
      </div>

      {/* Animations (future) */}
      <div className="advanced-section">
        <div className="advanced-section-title">Animations</div>
        <div className="advanced-subsection">
          {/* TODO */}
        </div>
      </div>
    </details>
  );
}
