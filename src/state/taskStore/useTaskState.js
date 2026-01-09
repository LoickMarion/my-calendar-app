// useTaskState.js
import { useState, useEffect, useCallback } from 'react';
import { loadTasks } from '../../data/loadTasks';
import { addDeterministicIds, initializeCategories as initCategories } from './taskUtils';

/**
 * Custom hook to manage all task-related state.
 * Tasks are the source of truth.
 * Categories are derived from tasks.
 */
export function useTaskState() {
  // --- Core state ---
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);

  // --- Category state (derived) ---
  const [enabledCategories, setEnabledCategories] = useState({});
  const [categoryColors, setCategoryColors] = useState({});

  // --- Completion + UI state ---
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  // --- UI toggles ---
  const toggleShowIncompleteOnly = useCallback(() => {
    setShowIncompleteOnly(prev => !prev);
  }, []);

  // -------------------------------
  // Load persisted category colors
  // -------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calendar_category_colors');
      if (saved) setCategoryColors(JSON.parse(saved));
    } catch (err) {
      console.warn('Failed to load category colors from localStorage', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'calendar_category_colors',
        JSON.stringify(categoryColors)
      );
    } catch (err) {
      console.warn('Failed to save category colors to localStorage', err);
    }
  }, [categoryColors]);

 
  // -------------------------------
  // Load tasks ONCE
  // -------------------------------
  useEffect(() => {
    const maybe = loadTasks();

    const applyTasks = (data) => {
      const withIds = addDeterministicIds(data || {});
      setTasks(withIds);
    };

    if (maybe && typeof maybe.then === 'function') {
      maybe.then(applyTasks).catch(err => {
        console.error('Failed to load tasks:', err);
      });
    } else {
      applyTasks(maybe);
    }
  }, []);

  // -----------------------------------------
  // Derive categories whenever tasks change
  // -----------------------------------------
  useEffect(() => {
    if (!tasks || Object.keys(tasks).length === 0) return;

    const { enabledCategories: nextEnabled, categoryColors: nextColors } =
      initCategories(tasks, enabledCategories, categoryColors);

    setEnabledCategories(nextEnabled);
    setCategoryColors(nextColors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // -----------------------------------------
  // Import tasks (merge or replace)
  // -----------------------------------------
  const importTasks = useCallback(
    (newTasks = {}, options = { replace: false }) => {
      if (options.replace) {
        setTasks(newTasks);
        // initialize categories for new tasks
        const { enabledCategories: nextEnabled, categoryColors: nextColors } =
          initCategories(newTasks, enabledCategories, categoryColors);
        setEnabledCategories(nextEnabled);
        setCategoryColors(nextColors);
        return;
      }

      setTasks(prev => {
        const merged = { ...prev };
        for (const dateKey of Object.keys(newTasks)) {
          if (!merged[dateKey]) merged[dateKey] = [];
          merged[dateKey] = merged[dateKey].concat(newTasks[dateKey]);
        }
        // update categories
        const { enabledCategories: nextEnabled, categoryColors: nextColors } =
          initCategories(merged, enabledCategories, categoryColors);
        setEnabledCategories(nextEnabled);
        setCategoryColors(nextColors);
        return merged;
      });
    },
    [enabledCategories, categoryColors]
  );

  return {
    // Dates
    selectedDate,
    setSelectedDate,

    // Tasks
    tasks,
    setTasks,
    importTasks, // <-- new

    // Editing
    editingTask,
    setEditingTask,

    // Categories
    enabledCategories,
    setEnabledCategories,
    categoryColors,
    setCategoryColors,

    // UI flags
    showIncompleteOnly,
    toggleShowIncompleteOnly,
  };
}
