// components/nav/theme/AnimationOptions.jsx
import React, { useState } from 'react';
import CaseText from '../../CaseText.jsx';

import CelebrationPreview from '../../celebration/CelebrationPreview.jsx';

export default function AnimationOptions({ theme, setThemeVar }) {
  const mode = theme['completion-animation'] || 'none';
  const [preview, setPreview] = useState(null);

  function playPreview(mode) {
    if (mode === 'none') return;
    setPreview(mode);
    setTimeout(() => setPreview(null), 1500);
  }

  return (
    <div className="theme-settings-row animation-options">
      <span className="theme-settings-label">
        <CaseText>Completion Animation</CaseText>
      </span>

      <div className="animation-options-controls">
        <select
          className="theme-select"
          value={mode}
          onChange={(e) => setThemeVar('completion-animation', e.target.value)}
        >
          <option value="none"><CaseText>None</CaseText></option>
            <option value="party"><CaseText>Party Mix</CaseText></option>
        </select>

        {/* <button className="btn" onClick={() => playPreview(mode)}>
          <CaseText>Test Animation</CaseText>
        </button> */}
      </div>

      {preview && <CelebrationPreview mode={preview} />}
    </div>
  );
}
