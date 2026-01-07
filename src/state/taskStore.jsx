// taskStore.jsx
// Minimal React Context store for selectedDate and tasks loaded from JSON.
// Exposes: selectedDate, setSelectedDate, tasks, getTasksForDate

import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadTasks } from '../data/loadTasks';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState({});

  const [editingTask, setEditingTask] = useState(null);

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

  function addTask(dateKey, task) {
    setTasks((prev) => {
      const arr = prev[dateKey] || [];
      const index = arr.length;

      const category =
        (task.category && task.category.toString().trim()) ||
        'Uncategorized';

      const id = `task__${dateKey}__${category}__${index}`;

      const newTask = {
        id,
        category,
        description: task.text, // task text stored as description
      };

      return {
        ...prev,
        [dateKey]: [...arr, newTask],
      };
    });
  }

  function deleteTask(dateKey, taskId) {

    //first part is 'task'
    const [__,idDate, category, indexStr] = taskId.split('__');
    const index = parseInt(indexStr, 10);

    setTasks(prev => {
      const arr = prev[dateKey] || [];
      const categoryTasks = arr.filter(t => t.category === category);
      const taskToDelete = categoryTasks[index];

      if (!taskToDelete) return prev;

      const filtered = arr.filter(t => t !== taskToDelete);

      return { ...prev, [dateKey]: filtered };
    });

    setCompletedTasks(prev => {
      if (!prev[dateKey]) return prev;
      const updated = { ...prev[dateKey] };
      delete updated[taskId];
      return { ...prev, [dateKey]: updated };
    });
  }

  function startEditTask(dateKey, taskId) {
    console.log('startEditTask', dateKey, taskId);

    const [__,idDate, category, indexStr] = taskId.split('__');
    const index = parseInt(indexStr, 10);

    const arr = tasks[dateKey] || [];
    const categoryTasks = arr.filter(t => t.category === category);
    const task = categoryTasks[index];

    if (!task) {
      console.warn('Task not found for editing:', dateKey, taskId);
      return;
    }

    setEditingTask({ dateKey, taskId, task });
  }

  function cancelEditTask() {
    console.log('cancelEditTask');
    setEditingTask(null);
  }

  function saveTaskEdits(dateKey, taskId, updates) {
    console.log('saveTaskEdits', dateKey, taskId, updates);

    const [__, fromDateKey, category, indexStr] = taskId.split('__');
    const index = parseInt(indexStr, 10);

    setTasks(prev => {
      const fromArr = prev[fromDateKey] || [];
      const categoryTasks = fromArr.filter(t => t.category === category);
      const taskToUpdate = categoryTasks[index];

      if (!taskToUpdate) return prev;

      const updatedTask = {
        ...taskToUpdate,
        ...updates
      };

      // DATE CHANGED → MOVE TASK
      if (fromDateKey !== dateKey) {
        const toArr = prev[dateKey] || [];

        return {
          ...prev,
          [fromDateKey]: fromArr.filter(t => t !== taskToUpdate),
          [dateKey]: [...toArr, updatedTask]
        };
      }

      // SAME DATE → UPDATE IN PLACE
      return {
        ...prev,
        [fromDateKey]: fromArr.map(t =>
          t === taskToUpdate ? updatedTask : t
        )
      };
    });

    setEditingTask(null);
  }


  function addCategory(cat) {
    setEnabledCategories(prev => ({ ...prev, [cat]: true }));
    setCategoryColor(cat, 'hsl(220 60% 60%)'); // or reuse your generator
  }

  function deleteCategory(cat) {
    setTasks((prev) => {
      const newTasks = {};

      for (const dateKey of Object.keys(prev)) {
        const arr = prev[dateKey] || [];
        // Keep only tasks NOT in this category
        const filtered = arr.filter((t) => (t.category || 'Uncategorized') !== cat);
        if (filtered.length > 0) newTasks[dateKey] = filtered;
      }

      return newTasks;
    });

    setCompletedTasks((prev) => {
      const newCompleted = {};
      for (const dateKey of Object.keys(prev)) {
        const day = prev[dateKey];
        if (!day) continue;
        const updatedDay = {};
        for (const taskId of Object.keys(day)) {
          if (!taskId.includes(`__${cat}__`)) {
            updatedDay[taskId] = day[taskId];
          }
        }
        if (Object.keys(updatedDay).length > 0) newCompleted[dateKey] = updatedDay;
      }
      return newCompleted;
    });

    // Remove the category from enabledCategories
    setEnabledCategories((prev) => {
      const out = { ...prev };
      delete out[cat];
      return out;
    });

    // Remove the category color
    setCategoryColors((prev) => {
      const out = { ...prev };
      delete out[cat];
      return out;
    });
  }

  function renameCategory(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;

    setTasks((prev) => {
      const newTasks = {};
      for (const dateKey of Object.keys(prev)) {
        newTasks[dateKey] = (prev[dateKey] || []).map((t) => {
          if ((t.category || 'Uncategorized') === oldName) {
            return { ...t, category: newName };
          }
          return t;
        });
      }
      return newTasks;
    });

    // Update category enabled state
    setEnabledCategories((prev) => {
      const out = { ...prev };
      if (prev[oldName] !== undefined) {
        out[newName] = prev[oldName];
        delete out[oldName];
      }
      return out;
    });

    // Update category color
    setCategoryColors((prev) => {
      const out = { ...prev };
      if (prev[oldName] !== undefined) {
        out[newName] = prev[oldName];
        delete out[oldName];
      }
      return out;
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

  function tasksToCSV(tasks) {
    const rows = [["date", "category", "text"]];

    for (const dateKey of Object.keys(tasks)) {
      const arr = tasks[dateKey] || [];
      arr.forEach((t) => {
        rows.push([
          dateKey,
          t.category || "",
          t.description || ""
        ]);
      });
    }

    return rows.map((r) => r.map(escapeCSV).join(",")).join("\n");
  }

  function escapeCSV(value) {
    if (value == null) return "";
    const str = value.toString();
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function reorderTask(dateKey, activeId, overId) {
    const [_, categoryA, indexA] = activeId.split('__');
    const [__, categoryB, indexB] = overId.split('__');
    const iA = parseInt(indexA, 10);
    const iB = parseInt(indexB, 10);

    setTasks(prev => {
      const arr = prev[dateKey] || [];
      const categoryTasks = arr.filter(t => t.category === categoryA);
      const task = categoryTasks[iA];
      if (!task) return prev;

      // Remove old
      let newArr = arr.filter(t => t !== task);

      // Insert at new index
      const before = newArr.filter(t => t.category === categoryB).slice(0, iB);
      const after = newArr.filter(t => t.category === categoryB).slice(iB);
      newArr = [...newArr.filter(t => t.category !== categoryB), ...before, task, ...after];

      return { ...prev, [dateKey]: newArr };
    });
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

  function moveTask(dateKey, activeId, overId) {
    const [_, categoryA, indexA] = activeId.split('__');
    const [__, categoryB, indexB] = overId.split('__');
    const iA = parseInt(indexA, 10);
    const iB = parseInt(indexB, 10);

    setTasks(prev => {
      const arr = prev[dateKey] || [];

      if (categoryA !== categoryB) {
        // For now, only allow moves **within same category**
        return prev;
      }

      // Extract all tasks in this category
      const categoryTasks = arr.filter(t => t.category === categoryA);
      const task = categoryTasks[iA];
      if (!task) return prev;

      // Remove from old position
      const newCategoryTasks = [...categoryTasks];
      newCategoryTasks.splice(iA, 1);

      // Insert at new position
      newCategoryTasks.splice(iB, 0, task);

      // Rebuild array preserving category order
      const newArr = [];
      arr.forEach(t => {
        if (t.category === categoryA) {
          // Insert the reordered category tasks only once
          if (!newArr.some(tt => tt.category === categoryA)) {
            newArr.push(...newCategoryTasks);
          }
        } else {
          newArr.push(t);
        }
      });

      return { ...prev, [dateKey]: newArr };
    });
  }


  function moveTaskToDate(sourceDateKey, targetDateKey, taskId) {
    console.log('moveTaskToDate', sourceDateKey, targetDateKey, taskId);
    const [, category, indexStr] = taskId.split('__');
    const index = parseInt(indexStr, 10);

    setTasks(prev => {
      const sourceArr = prev[sourceDateKey] || [];
      const targetArr = prev[targetDateKey] || [];

      // Get all tasks in the same category (stable order)
      const sourceCategoryTasks = sourceArr.filter(
        t => t.category === category
      );

      const taskToMove = sourceCategoryTasks[index];
      if (!taskToMove) return prev;

      // Remove task from source day
      const newSourceArr = sourceArr.filter(t => t !== taskToMove);

      // Add task to target day (append at end for now)
      const newTargetArr = [...targetArr, taskToMove];

      return {
        ...prev,
        [sourceDateKey]: newSourceArr,
        [targetDateKey]: newTargetArr
      };
    });

    // Move completion state if present
    setCompletedTasks(prev => {
      const sourceCompleted = prev[sourceDateKey] || {};
      const targetCompleted = prev[targetDateKey] || {};

      if (!sourceCompleted[taskId]) return prev;

      const updatedSource = { ...sourceCompleted };
      delete updatedSource[taskId];

      return {
        ...prev,
        [sourceDateKey]: updatedSource,
        [targetDateKey]: {
          ...targetCompleted,
          [taskId.replace(sourceDateKey, targetDateKey)]: true
        }
      };
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
      importTasks,
      addTask,
      deleteTask,
      editingTask,
      startEditTask,
      cancelEditTask,
      saveTaskEdits,
      addCategory,
      deleteCategory,
      renameCategory,
      tasksToCSV,
      escapeCSV,
      reorderTask,
      moveTask,
      moveTaskToDate,
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
