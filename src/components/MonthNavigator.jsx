// components/MonthNavigator.jsx
import React from 'react';

export default function MonthNavigator({ monthLabel, onPrev, onNext }) {
  return (
    <div
      className="month-navigator"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '0.5rem'
      }}
    >
      <button onClick={onPrev} aria-label="Previous month">◀</button>
      <div style={{ fontWeight: 600 }}>{monthLabel}</div>
      <button onClick={onNext} aria-label="Next month">▶</button>
    </div>
  );
}
