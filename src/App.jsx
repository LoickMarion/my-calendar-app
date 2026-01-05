// App.jsx
// Root app component: wires navigation, calendar and day view together.
// Uses TaskProvider to access selected date and tasks.

import React, { useState } from 'react';
import { TaskProvider, useTaskStore } from './state/taskStore.jsx';
import { ThemeProvider } from './state/themeStore.jsx';
import NavigationBar from './components/NavigationBar';
import CalendarGrid from './components/CalendarGrid';
import DayView from './components/DayView';
import CategoriesFilter from './components/CategoriesFilter';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundShapes from './components/BackgroundShapes';
import './styles/globals.css';

function AppContent() {
  // Keep month/year at top-level so NavigationBar + CalendarGrid can interact.
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

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

      <div className="app-layout" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <CategoriesFilter />

        <div style={{ flex: 1 }}>
          {/* Background shapes are absolute in .app-shell so they sit behind widgets */}
          <BackgroundShapes />

          <CalendarGrid
            year={current.year}
            month={current.month}
            onSelectDate={(d) => setSelectedDate(d)}
            selectedDate={selectedDate}
            tasks={filteredTasks}
          />

          <DayView />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Wrap the app with the ThemeProvider and TaskProvider so any component can access theme + tasks
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
