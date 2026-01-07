// NavigationBar.jsx
import React from 'react';
import ImportControls from './ImportControls';
import ThemeSettings from './ThemeSettings';

export default function NavigationBar() {
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
      <ImportControls />
      <ThemeSettings />
    </header>
  );
}
