// NavigationBar.jsx
import React from 'react';
import ImportControls from './ImportControls';
import ThemeSettings from './ThemeSettings';
import ModeToggle from './ModeToggle';
import CaseToggle from './CaseToggle';
import FilterCompleted from './FilterCompleted';
import JumpToToday from './JumpToToday';

export default function NavigationBar({ mode, cycleMode, setCurrent, setSelectedDate }) {
  return (
    <header className="navigation-bar">
      <div className="nav-item">
        <JumpToToday setCurrent={setCurrent} setSelectedDate={setSelectedDate} />
      </div>
      <div className="nav-item"><FilterCompleted /></div>
      <div className="nav-item"><CaseToggle /></div>
      <div className="nav-item"><ModeToggle mode={mode} cycleMode={cycleMode} /></div>
      <div className="nav-item"><ThemeSettings /></div>
      <div className="nav-item"><ImportControls /></div>
    </header>
  );
}

