// App.jsx
// Root app component: wires navigation, calendar, categories, add-task panel,
// and day view together. Now includes global deleteMode state.

import React, { useState } from 'react';
import { TaskProvider, useTaskStore } from './state/taskStore.jsx';
import { ThemeProvider } from './state/themeStore.jsx';

import NavigationBar from './components/NavigationBar';
import CalendarGrid from './components/CalendarGrid';
import DayView from './components/DayView';
import CategoriesFilter from './components/CategoriesFilter';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundShapes from './components/BackgroundShapes';
import AddTaskPanel from './components/AddTaskPanel';

import './styles/globals.css';

function AppContent() {
  // Month/year navigation state
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Global delete mode
  const [mode, setMode] = useState('select'); 

  function cycleMode() {
    setMode((prev) => {
      if (prev === 'select') return 'delete';
      if (prev === 'delete') return 'edit';
      return 'select';
    });
  }

  const { setSelectedDate, selectedDate, getFilteredTasks } = useTaskStore();

  function handlePrev() {
    let { year, month } = current;
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    setCurrent({ year, month });
  }

  function handleNext() {
    let { year, month } = current;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    setCurrent({ year, month });
  }

  const monthLabel = new Date(current.year, current.month, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric'
  });

  const filteredTasks = getFilteredTasks();

  return (
    <div className="app-shell">
      <NavigationBar onPrev={handlePrev} onNext={handleNext} monthLabel={monthLabel} />

    <div style={{ padding: '0.5rem 0' }}>
      <button
        onClick={cycleMode}
        className={`mode-toggle mode-${mode}`}
      >
        Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </button>
    </div>

      <div
        className="app-layout"
        style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
      >
        {/* Left column: categories + add task */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <CategoriesFilter mode={mode} />
          <AddTaskPanel className="add-task-panel" />
        </div>

        {/* Right column: calendar + day view */}
        <div style={{ flex: 1 }}>
          <BackgroundShapes />

          <CalendarGrid
            year={current.year}
            month={current.month}
            onSelectDate={(d) => setSelectedDate(d)}
            selectedDate={selectedDate}
            tasks={filteredTasks}
          />

          <DayView mode={mode} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </TaskProvider>
    </ThemeProvider>
  );
}
