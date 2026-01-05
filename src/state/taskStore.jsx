// taskStore.jsx
// Minimal React Context store for selectedDate and tasks loaded from JSON.
// Exposes: selectedDate, setSelectedDate, tasks, getTasksForDate

import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadTasks } from '../data/loadTasks';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState({});

  // enabledCategories is a map from categoryKey -> boolean
  const [enabledCategories, setEnabledCategories] = useState({});

  // categoryColors stores a color string per category (e.g., 'hsl(120 60% 60%)')
  const [categoryColors, setCategoryColors] = useState({});

  // --- Completion state ---
  const [completedTasks, setCompletedTasks] = useState({});

  // Toggle completion for a specific task
  function toggleTaskComplete(dateKey, taskId) {
    setCompletedTasks(prev => {
      const day = prev[dateKey] || {};
      const updated = { ...day, [taskId]: !day[taskId] };
      return { ...prev, [dateKey]: updated };
    });
  }



  // Check if a task is complete
  function isTaskComplete(dateKey, taskId) {
    return !!(completedTasks[dateKey] && completedTasks[dateKey][taskId]);
  }


  function addDeterministicIds(tasksObj) {
    const out = {};

    for (const dateKey of Object.keys(tasksObj)) {
      const arr = tasksObj[dateKey] || [];

      out[dateKey] = arr.map((t, index) => {
        const category =
          (t.category && t.category.toString().trim()) ||
          'Uncategorized';

        const id = `${dateKey}__${category}__${index}`;

        return { ...t, id };
      });
    }

    return out;
  }

  // Persist/load category bubble colors to localStorage so user customizations survive reloads
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
      localStorage.setItem('calendar_category_colors', JSON.stringify(categoryColors));
    } catch (err) {
      console.warn('Failed to save category colors to localStorage', err);
    }
  }, [categoryColors]);

  // Load completion state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("calendar_completed_tasks");
      if (saved) setCompletedTasks(JSON.parse(saved));
    } catch {}
  }, []);

  // Save completion state
  useEffect(() => {
    try {
      localStorage.setItem("calendar_completed_tasks", JSON.stringify(completedTasks));
    } catch {}
  }, [completedTasks]);


  useEffect(() => {
    // loadTasks can be synchronous (returns object) or asynchronous (Promise)
    const maybe = loadTasks();
    if (maybe && typeof maybe.then === 'function') {
      // If tasks are loaded from a remote source (e.g., Google Sheet), initialize categories from that source
      maybe.then((data) => {
        const withIds = addDeterministicIds(data);
        setTasks(withIds);
        initializeCategories(withIds);
      }).catch((err) => {
        console.error('Failed to load tasks:', err);
      });
    } else {
      // Local fallback (e.g., built-in tasks.json) should NOT populate categories by default.
      // Categories remain empty until the user imports a file or a sheet is explicitly loaded.
      setTasks(addDeterministicIds(maybe));
    }
  }, []);

  // Helper to get canonical category key for a task.
  // Prefer explicit `category` column if present; fallback to 'Uncategorized'.
  function getCategoryKeyForTask(t) {
    return (t.category && t.category.toString().trim()) || 'Uncategorized';
  }

  function initializeCategories(tasksObj) {
    const cats = [];

    // First, collect explicit categories (from `category` column)
    for (const dateKey of Object.keys(tasksObj || {})) {
      const arr = tasksObj[dateKey] || [];
      arr.forEach((t) => {
        if (t.category && t.category.toString().trim()) {
          const c = t.category.toString().trim();
          if (!cats.includes(c)) cats.push(c);
        }
      });
    }

    // If no explicit categories found, fallback to using titles as categories (wide-format support)
    if (cats.length === 0) {
      for (const dateKey of Object.keys(tasksObj || {})) {
        const arr = tasksObj[dateKey] || [];
        arr.forEach((t) => {
          const title = (t.title && t.title.toString().trim());
          if (title && !cats.includes(title)) cats.push(title);
        });
      }
    }

    // If still empty, leave categories empty (do not auto-populate from local tasks.json)
    if (cats.length === 0) return;

    // Safety: limit categories to 100 distinct values
    if (cats.length > 100) {
      console.error('Too many categories (>100). Truncating to first 100.');
      cats.splice(100);
    }

    // Preserve previous selections where possible
    setEnabledCategories((prev = {}) => {
      const map = {};
      cats.forEach((c) => {
        map[c] = prev[c] !== undefined ? !!prev[c] : true;
      });
      // If there was an 'Uncategorized' previously and no explicit uncategorized tasks exist, preserve it
      if (prev['Uncategorized'] && !map['Uncategorized']) map['Uncategorized'] = true;
      return map;
    });

    // Assign colors for any new categories while preserving existing colors
    setCategoryColors((prev = {}) => {
      const out = { ...prev };
      // Use a deterministic generation (golden angle) to make colors distinct
      const used = new Set(Object.values(out));
      let seed = Math.floor(Math.random() * 360);
      function genColor(i) {
        const hue = Math.round((seed + i * 137.508) % 360);
        const saturation = 60; // percent
        const lightness = 52; // percent
        return `hsl(${hue} ${saturation}% ${lightness}%)`;
      }

      cats.forEach((c, idx) => {
        if (!out[c]) {
          let tries = 0;
          let color;
          do {
            color = genColor(idx + tries);
            tries++;
            if (tries > 360) throw new Error('Failed to generate unique category colors');
          } while (used.has(color));
          used.add(color);
          out[c] = color;
        }
      });

      return out;
    });
  }

  // Returns categories as an array
  function getCategories() {
    return Object.keys(enabledCategories).sort();
  }

  function getCategoryCounts() {
    const counts = {};
    for (const dateKey of Object.keys(tasks || {})) {
      const arr = tasks[dateKey] || [];
      arr.forEach((t) => {
        const c = getCategoryKeyForTask(t);
        counts[c] = (counts[c] || 0) + 1;
      });
    }
    return counts;
  }

  function getCategoryColor(cat) {
    return categoryColors[cat] || 'hsl(220 60% 60%)';
  }

  function setCategoryColor(cat, color) {
    setCategoryColors((prev) => ({ ...prev, [cat]: color }));
  }

  function isCategoryEnabled(cat) {
    return !!enabledCategories[cat];
  }

  function setCategoryEnabled(cat, enabled) {
    setEnabledCategories((prev) => ({ ...prev, [cat]: !!enabled }));
  }

  function toggleAllCategories(enabled) {
    setEnabledCategories((prev) => {
      const out = {};
      Object.keys(prev).forEach((k) => (out[k] = !!enabled));
      return out;
    });
  }

  function getTasksForDate(date) {
    if (!date) return [];
    const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const arr = tasks[key] || [];
    // filter by enabled categories
    return arr.filter((t) => isCategoryEnabled(getCategoryKeyForTask(t)));
  }

  function getFilteredTasks() {
    const out = {};
    for (const dateKey of Object.keys(tasks || {})) {
      const arr = tasks[dateKey].filter((t) => isCategoryEnabled(getCategoryKeyForTask(t)));
      if (arr.length > 0) out[dateKey] = arr;
    }
    return out;
  }

  function importTasks(newTasks = {}, options = { replace: false }) {
    if (options.replace) {
      setTasks(newTasks);
      initializeCategories(newTasks);
      return;
    }

    setTasks((prev) => {
      const merged = { ...prev };
      for (const dateKey of Object.keys(newTasks)) {
        if (!merged[dateKey]) merged[dateKey] = [];
        merged[dateKey] = merged[dateKey].concat(newTasks[dateKey]);
      }
      // Update categories to include any new ones
      initializeCategories(merged);
      return merged;
    });
  }

  return (
    <TaskContext.Provider value={{
      selectedDate,
      setSelectedDate,
      tasks,
      completedTasks, 
      toggleTaskComplete, 
      isTaskComplete,
      getTasksForDate,
      getFilteredTasks,
      getCategories,
      getCategoryCounts,
      getCategoryColor,
      setCategoryColor,
      isCategoryEnabled,
      setCategoryEnabled,
      toggleAllCategories,
      importTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskStore() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskStore must be used within a TaskProvider');
  return ctx;
}
