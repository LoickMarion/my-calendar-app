// App.jsx
// Root app component with global DnD support for moving tasks across days

import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin
} from '@dnd-kit/core';

import { TaskProvider, useTaskStore } from './state/taskStore.jsx';
import { ThemeProvider } from './state/themeStore.jsx';

import NavigationBar from './components/NavigationBar';
import CalendarGrid from './components/CalendarGrid';
import DayView from './components/DayView';
import CategoriesFilter from './components/CategoriesFilter';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundShapes from './components/BackgroundShapes';
import AddTaskPanel from './components/AddTaskPanel';
import MonthNavigator from './components/MonthNavigator';


import './styles/globals.css';

function AppContent() {
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [mode, setMode] = useState('select');

  const {
    selectedDate,
    setSelectedDate,
    getFilteredTasks,
    moveTaskToDate,
    moveTask
  } = useTaskStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function cycleMode() {
    setMode(prev =>
      prev === 'select' ? 'delete' : prev === 'delete' ? 'edit' : 'select'
    );
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
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
    >
      <div className="app-shell" style={{ position: 'relative' }}>
        <BackgroundShapes />

        <div className="app-content" style={{ position: 'relative', zIndex: 1 }}>
          <NavigationBar
            mode={mode}
            cycleMode={cycleMode}
          />
          
          <div
            className="app-layout"
            style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CategoriesFilter mode={mode} />
              <AddTaskPanel />
            </div>

            <div style={{ flex: 1 }}>
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
              <DayView mode={mode} />
            </div>
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
