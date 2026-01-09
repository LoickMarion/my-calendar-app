// components/ModeToggle.jsx

import React from 'react';

import CaseText from '../CaseText';

export default function ModeToggle({ mode, cycleMode }) {
  const str = 'Mode: ' + String(mode);
  return (
    <button
      onClick={cycleMode}
      className={`btn mode-toggle mode-${mode}`}
    >
      <CaseText> {str} </CaseText>
    </button>
  );
}
