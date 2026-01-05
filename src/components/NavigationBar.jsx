// NavigationBar.jsx
// Simple navigation with previous/next month buttons and a month label.
// Props:
// - onPrev(): called when previous month clicked
// - onNext(): called when next month clicked
// - monthLabel: string (e.g., "January 2025")

import React from 'react';
import ImportControls from './ImportControls';
import ThemeSettings from './ThemeSettings';

export default function NavigationBar({ onPrev, onNext, monthLabel }) {
  return (
    <header className="navigation-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onPrev} aria-label="Previous month">◀ Previous</button>
        <div className="month-label" aria-live="polite" style={{ fontWeight: '600' }}>{monthLabel}</div>
        <button onClick={onNext} aria-label="Next month">Next ▶</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ImportControls />
        <ThemeSettings />
      </div>
    </header>
  );
}
