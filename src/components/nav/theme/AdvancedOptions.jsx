import React from 'react';
import BackgroundShapesOptions from './BackgroundShapesOptions';
import CustomBulletPoints from './CustomBulletPoints';
import AnimationOptions from './AnimationOptions.jsx';
import CaseText from '../../CaseText.jsx';

export default function AdvancedOptions({ theme, setThemeVar }) {
  return (
    <details className="theme-advanced-options">
      <summary className="advanced-summary"><CaseText>Advanced Options</CaseText></summary>

      {/* Background Shapes */}
      <div className="advanced-section">
        <div className="advanced-section-title"><CaseText>Background Shapes</CaseText></div>
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
        <div className="advanced-section-title"><CaseText>Animations</CaseText></div>
        <div className="advanced-subsection">
          <AnimationOptions theme={theme} setThemeVar={setThemeVar} />
        </div>
      </div>
    </details>
  );
}
