// NavigationBar.jsx
import React from 'react';
import ImportControls from './ImportControls';
import ThemeSettings from './ThemeSettings';
import ModeToggle from './ModeToggle';

export default function NavigationBar({ mode, cycleMode }) {
  return (
    <header
      className="navigation-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        justifyContent: 'flex-end'
      }}
    >
      <ModeToggle mode={mode} cycleMode={cycleMode} />
      <ImportControls />
      <ThemeSettings />
    </header>
  );
}
