// App.jsx
import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin
} from '@dnd-kit/core';

import { TaskProvider, useTaskStore } from './state/taskStore/index.jsx';
import { ThemeProvider } from './state/themeStore.jsx';

import NavigationBar from './components/nav/NavigationBar.jsx';
import CalendarGrid from './components/CalendarGrid';
import DayView from './components/DayView';
import CategoriesFilter from './components/CategoriesFilter';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundShapes from './components/BackgroundShapes';
import AddTaskPanel from './components/AddTaskPanel';
import MonthNavigator from './components/MonthNavigator';

/* Import the split CSS files */
import './styles/globals.css';
import './styles/layout.css';
import './styles/calendar.css';
import './styles/components/buttons.css';
import './styles/components/NavigationBar.css';
import './styles/components/MonthNavigator.css';
import './styles/components/AddTaskPanel.css';
import './styles/components/CategoriesFilter.css';
import './styles/components/DayView.css';
import './styles/components/ThemeSettings.css';
import './styles/components/AdvancedOptions.css';
import './styles/components/ModeToggle.css';
import './styles/components/TaskItem.css';


function AppContent() {
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [mode, setMode] = useState('select');

  const { selectedDate, setSelectedDate, getFilteredTasks, moveTaskToDate, moveTask } = useTaskStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function cycleMode() {
    setMode(prev => (prev === 'select' ? 'delete' : prev === 'delete' ? 'edit' : 'select'));
  }

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

  const monthLabel = new Date(current.year, current.month, 1).toLocaleString(
    undefined,
    { month: 'long', year: 'numeric' }
  );

  const filteredTasks = getFilteredTasks();

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId.startsWith('task__') && overId.startsWith('task__')) {
      const taskId = activeId.replace(/^task__/, '');
      const targetId = overId.replace(/^task__/, '');
      const dateKey = taskId.split('__')[0];
      moveTask(dateKey, taskId, targetId);
      return;
    }

    if (activeId.startsWith('task__') && overId.startsWith('day__')) {
      const taskId = activeId.replace(/^task__/, '');
      const fromDateKey = taskId.split('__')[0];
      const toDateKey = overId.replace(/^day__/, '');
      if (fromDateKey === toDateKey) return;
      moveTaskToDate(fromDateKey, toDateKey, taskId);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      <div className="app-shell">
        <BackgroundShapes />

        <div className="app-content">

          <NavigationBar
            mode={mode}
            cycleMode={cycleMode}
            setCurrent={setCurrent}
            setSelectedDate={setSelectedDate}
          />

          {/* THREE-COLUMN LAYOUT */}
          <div className="app-layout">

            {/* LEFT SIDEBAR */}
            <aside className="sidebar-left">
              <CategoriesFilter mode={mode} />
              <AddTaskPanel />
            </aside>

            {/* MIDDLE COLUMN — calendar */}
            <main className="calendar-column">
              <MonthNavigator
                monthLabel={monthLabel}
                onPrev={handlePrev}
                onNext={handleNext}
              />

              <CalendarGrid
                year={current.year}
                month={current.month}
                onSelectDate={setSelectedDate}
                selectedDate={selectedDate}
                tasks={filteredTasks}
              />
            </main>

            {/* RIGHT SIDEBAR — day view */}
            <aside className="sidebar-right">
              <DayView mode={mode} />
            </aside>

          </div>
        </div>
      </div>
    </DndContext>
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
