// App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin
} from '@dnd-kit/core';

import { TaskProvider, useTaskStore } from './state/taskStore/index.jsx';
import { ThemeProvider, useThemeStore } from './state/themeStore.jsx';

import NavigationBar from './components/nav/NavigationBar.jsx';
import CalendarGrid from './components/CalendarGrid';
import DayView from './components/DayView';
import CategoriesFilter from './components/CategoriesFilter';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundShapes from './components/BackgroundShapes';
import AddTaskPanel from './components/AddTaskPanel';
import MonthNavigator from './components/MonthNavigator';
import CaseText from './components/CaseText.jsx';

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
import './styles/components/themes/ThemeSettings.css';
import './styles/components/themes/BackgroundShapesOptions.css'
import './styles/components/ModeToggle.css';
import './styles/components/TaskItem.css';
import './styles/components/themes/CustomBulletPoints.css';
import './styles/components/themes/AnimationOptions.css';
import './components/celebration/celebration.css'

import { useGoogleLogin } from "@react-oauth/google"
import { loadThemeFromDrive } from './data/googleDriveTheme.js';
import { loadTasksFromDrive } from './data/googleDriveTasks.js';

const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const AUTH_STORAGE_KEY = 'calendar_google_auth';

function AppContent() {
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [mode, setMode] = useState('select');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const { selectedDate, setSelectedDate, getFilteredTasks, moveTaskToDate, moveTask, importTasks } = useTaskStore();
  const { setThemeVar } = useThemeStore();

  const applyToken = useCallback(async (accessToken, expiresInSeconds) => {
    setIsSignedIn(true);
    setAccessToken(accessToken);

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken,
        expiresAt: Date.now() + expiresInSeconds * 1000,
      })
    );

    try {
      const savedTheme = await loadThemeFromDrive(accessToken);
      if (savedTheme) {
        Object.entries(savedTheme).forEach(([key, value]) => setThemeVar(key, value));
      }
    } catch (err) {
      console.error('Failed to auto-load theme from Drive', err);
    }

    try {
      const savedTasks = await loadTasksFromDrive(accessToken);
      if (savedTasks) {
        importTasks(savedTasks, { replace: true });
      }
    } catch (err) {
      console.error('Failed to auto-load tasks from Drive', err);
    }
  }, [setThemeVar, importTasks]);

  const signIn = useGoogleLogin({
    flow: 'implicit',
    scope: DRIVE_FILE_SCOPE,
    onSuccess: (tokenResponse) => {
      applyToken(tokenResponse.access_token, tokenResponse.expires_in);
    },
    onError: () => {
      console.log('Login failed');
      localStorage.removeItem(AUTH_STORAGE_KEY);
    },
  });

  const signOut = useCallback(() => {
    if (accessToken) {
      fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).catch(() => {});
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsSignedIn(false);
    setAccessToken(null);
  }, [accessToken]);

  // On mount: reuse a still-valid stored token, or silently try to
  // refresh an expired one (no popup) before falling back to signed-out.
  useEffect(() => {
    let stored;
    try {
      stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    } catch {
      stored = null;
    }
    if (!stored) return;

    if (stored.expiresAt > Date.now()) {
      applyToken(stored.accessToken, (stored.expiresAt - Date.now()) / 1000);
    } else {
      signIn({ prompt: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

         <header className="app-header">
            <h1><CaseText>Pookie Calendar &lt;3</CaseText></h1>
            <nav className="app-header-links">
              {isSignedIn ? (
                <button className="link-button" type="button" onClick={signOut}>
                  Sign out
                </button>
              ) : (
                <button className="link-button" type="button" onClick={() => signIn()}>
                  Sign in with Google
                </button>
              )}
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
            </nav>
          </header>

        <div className="app-content">

          <NavigationBar
            mode={mode}
            cycleMode={cycleMode}
            setCurrent={setCurrent}
            setSelectedDate={setSelectedDate}
            isSignedIn={isSignedIn}
            accessToken={accessToken}
          />

          {/* THREE-COLUMN LAYOUT */}
          <div className="app-layout">

            {/* LEFT SIDEBAR */}
            <aside className="sidebar-left">
              <CategoriesFilter mode={mode} />
              <AddTaskPanel accessToken={accessToken} />
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
