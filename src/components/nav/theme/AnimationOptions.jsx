// components/nav/theme/AnimationOptions.jsx
import React, { useState } from 'react';
import CaseText from '../../CaseText.jsx';

import CelebrationPreview from '../../celebration/CelebrationPreview.jsx';

const ANIMATION_MODES = [
  { value: 'none', label: 'None' },
  { value: 'confetti', label: 'Confetti' },
  { value: 'sparkle', label: 'Sparkle' },
  { value: 'fireworks', label: 'Fireworks' },
  { value: 'ribbon', label: 'Ribbon' },
  { value: 'glow', label: 'Glow' },
  { value: 'party', label: 'Party Mix' },
];

export default function AnimationOptions({ theme, setThemeVar }) {
  const taskMode = theme['task-completion-animation'] || 'none';
  const dayMode = theme['day-completion-animation'] || 'none';
  const [preview, setPreview] = useState(null);

  function playPreview(mode) {
    if (mode === 'none') return;
    setPreview(mode);
    setTimeout(() => setPreview(null), 1500);
  }

  return (
    <>
      <div className="theme-settings-row animation-options">
        <span className="theme-settings-label">
          <CaseText>Task Completion Animation</CaseText>
        </span>

        <div className="animation-options-controls">
          <select
            className="theme-select"
            value={taskMode}
            onChange={(e) => setThemeVar('task-completion-animation', e.target.value)}
          >
            {ANIMATION_MODES.map(({ value, label }) => (
              <option key={value} value={value}><CaseText>{label}</CaseText></option>
            ))}
          </select>
        </div>
      </div>

      <div className="theme-settings-row animation-options">
        <span className="theme-settings-label">
          <CaseText>Day Completion Animation</CaseText>
        </span>

        <div className="animation-options-controls">
          <select
            className="theme-select"
            value={dayMode}
            onChange={(e) => setThemeVar('day-completion-animation', e.target.value)}
          >
            {ANIMATION_MODES.map(({ value, label }) => (
              <option key={value} value={value}><CaseText>{label}</CaseText></option>
            ))}
          </select>
        </div>
      </div>

      {preview && <CelebrationPreview mode={preview} />}
    </>
  );
}
