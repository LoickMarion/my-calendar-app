// components/MonthNavigator.jsx
import React from 'react';
import CaseText from './CaseText.jsx';

export default function MonthNavigator({ monthLabel, onPrev, onNext }) {
  return (
    <div className="month-navigator">
      <button className="btn" onClick={onPrev} aria-label="Previous month">◀</button>
      <div className="month-label"><CaseText>{monthLabel}</CaseText></div>
      <button className="btn" onClick={onNext} aria-label="Next month">▶</button>
    </div>
  );
}
