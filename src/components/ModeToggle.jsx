// components/ModeToggle.jsx

import React from 'react';

export default function ModeToggle({ mode, cycleMode }) {
  return (
    <button
      onClick={cycleMode}
      className={`btn mode-toggle mode-${mode}`}
    >
      Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
    </button>
  );
}
