// components/nav/CaseToggle.jsx
import React from 'react';

import { useThemeStore } from '../../state/themeStore.jsx'; 
import { applyTextCase } from '../../state/textCase.js';

export default function CaseToggle() {
  const { theme, setTextCase } = useThemeStore();
  return (
    <button
        className="btn"
        onClick={() => setTextCase(theme['text-case'] === 'title' ? 'lower' : 'title')}
        >
        {theme['text-case'] === 'title' ? 'Title Case' : 'lowercase'}
    </button>

  );
}
