// taskUtils.js
/**
 * Utility functions for managing tasks in the task store.
 */

import { toLocalDateKey, parseLocalDateKey } from '../date.js';

/** Normalize task ID by removing leading 'task__' if present */
export function normalizeTaskId(taskId) {
  return taskId.startsWith('task__') ? taskId.slice(6) : taskId;
}

/** Toggle completion of a task by updating its `completed` field */
//make a new task so there is a new reference to trigger a react update

function findIndexWithinGroup(arr, category, groupIndex) {
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].category === category) {
      if (count === groupIndex) return i;
      count++;
    }

  }

  return -1;
}

export function toggleTaskComplete( setTasks, dateKey, taskId) {
  setTasks(prev => {
    const arr = prev[dateKey] || [];
    const groupIndex = Number(taskId.split('__')[3]); // get index from id
    const index = findIndexWithinGroup(arr, taskId.split('__')[2], groupIndex);
    if (index === -1) return prev; // task not found

    const updatedTask = {
      ...arr[index],
      completed: !arr[index].completed
    };
    const newArr = [...arr];
    newArr[index] = updatedTask;

    return { ...prev, [dateKey]: newArr };
  });
}


/** Set the logged value of a numeric-goal task; `completed` is always re-derived from it. */
export function setTaskGoalValue(setTasks, dateKey, taskId, newValue) {
  setTasks(prev => {
    const arr = prev[dateKey] || [];
    const groupIndex = Number(taskId.split('__')[3]);
    const index = findIndexWithinGroup(arr, taskId.split('__')[2], groupIndex);
    if (index === -1) return prev;

    const task = arr[index];
    if (task.goalTarget == null) return prev; // not a goal task, no-op

    const clamped = Math.max(0, newValue);
    const newArr = [...arr];
    newArr[index] = { ...task, goalValue: clamped, completed: clamped >= task.goalTarget };

    return { ...prev, [dateKey]: newArr };
  });
}


/** Add deterministic IDs to tasks for consistency */
export function addDeterministicIds(tasksObj) {
  const out = {};

  for (const dateKey of Object.keys(tasksObj || {})) {
    const arr = tasksObj[dateKey] || [];
    out[dateKey] = arr.map((t, index) => {
      const category = getCategoryKeyForTask(t);
      const id = `${dateKey}__${category}__${index}`;
      return { ...t, id };
    });
  }

  return out;
}

/** Get canonical category key for a task */
export function getCategoryKeyForTask(task) {
  return (task.category && task.category.toString().trim()) || 'Uncategorized';
}

/**
 * Initialize categories from a set of tasks.
 */
export function initializeCategories(tasksObj, previousEnabledCategories = {}, previousCategoryColors = {}) {
  const cats = [];

  for (const dateKey of Object.keys(tasksObj || {})) {
    for (const t of tasksObj[dateKey] || []) {
      const c = t.category?.toString().trim();
      if (c && !cats.includes(c)) cats.push(c);
    }
  }

  if (cats.length === 0) {
    return {
      enabledCategories: previousEnabledCategories,
      categoryColors: previousCategoryColors,
    };
  }

  const enabledCategories = {};
  cats.forEach(c => {
    enabledCategories[c] =
      previousEnabledCategories[c] !== undefined
        ? previousEnabledCategories[c]
        : true;
  });

  const categoryColors = { ...previousCategoryColors };
  let seed = Math.floor(Math.random() * 360);

  cats.forEach((c, i) => {
    if (!categoryColors[c]) {
      const hue = (seed + i * 137.508) % 360;
      categoryColors[c] = `hsl(${Math.round(hue)} 60% 52%)`;
    }
  });

  return { enabledCategories, categoryColors };
}

/**
 * OLD SIGNATURE RESTORED
 * This now behaves exactly like before.
 */
export function getTasksForDate(tasks, enabledCategories, date) { 
    if (!date) return []; 

    let key = ''; 
    // Accept Date objects 
    if (date instanceof Date) { 
        key = toLocalDateKey(date); 
    } 

    else if (typeof date === 'string') { 
        // Accept 'YYYY-MM-DD' or similar 
        const parsed = parseLocalDateKey(date.slice(0, 10)); 
        if (!isNaN(parsed)) { key = toLocalDateKey(parsed); } 
    } 
    else {
         // Unknown type → bail out
          return []; 
        } 

    if (!key) return [];

    const arr = tasks[key] || [];
    return arr.filter((t) => { 
        const cat = getCategoryKeyForTask(t); 
        return enabledCategories[cat] !== false; 
    }); 
}

/** Get all tasks filtered by enabled categories */
export function getFilteredTasks(tasks, enabledCategories) {
  const out = {};

  for (const dateKey of Object.keys(tasks || {})) {
    const arr = tasks[dateKey].filter(t =>
      enabledCategories[getCategoryKeyForTask(t)] !== false
    );
    if (arr.length > 0) out[dateKey] = arr;
  }

  return out;
}
