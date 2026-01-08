
// categoryActions.js
/**
 * Category management actions for the task store.
 * All functions are pure and accept state + setters.
 */

/** Add a new category */
export function addCategory(setEnabledCategories, setCategoryColors, cat) {
  setEnabledCategories(prev => ({ ...prev, [cat]: true }));
  setCategoryColors(prev => ({ ...prev, [cat]: 'hsl(220 60% 60%)' }));
}

/** Delete a category and remove its tasks + completion states */
export function deleteCategory(tasks, setTasks, completedTasks, setCompletedTasks,
                               enabledCategories, setEnabledCategories,
                               categoryColors, setCategoryColors, cat) {
  // Remove tasks in this category
  setTasks(prev => {
    const newTasks = {};
    for (const dateKey of Object.keys(prev)) {
      const arr = prev[dateKey] || [];
      const filtered = arr.filter(t => (t.category || 'Uncategorized') !== cat);
      if (filtered.length > 0) newTasks[dateKey] = filtered;
    }
    return newTasks;
  });

  // Remove completed tasks in this category
  setCompletedTasks(prev => {
    const newCompleted = {};
    for (const dateKey of Object.keys(prev)) {
      const day = prev[dateKey];
      if (!day) continue;
      const updatedDay = {};
      for (const taskId of Object.keys(day)) {
        if (!taskId.includes(`__${cat}__`)) updatedDay[taskId] = day[taskId];
      }
      if (Object.keys(updatedDay).length > 0) newCompleted[dateKey] = updatedDay;
    }
    return newCompleted;
  });

  // Remove from enabledCategories
  setEnabledCategories(prev => {
    const out = { ...prev };
    delete out[cat];
    return out;
  });

  // Remove from categoryColors
  setCategoryColors(prev => {
    const out = { ...prev };
    delete out[cat];
    return out;
  });
}

/** Rename a category and update tasks, enabled state, and colors */
export function renameCategory(tasks, setTasks,
                               enabledCategories, setEnabledCategories,
                               categoryColors, setCategoryColors,
                               oldName, newName) {
  if (!oldName || !newName || oldName === newName) return;

  // Update tasks
  setTasks(prev => {
    const newTasks = {};
    for (const dateKey of Object.keys(prev)) {
      newTasks[dateKey] = (prev[dateKey] || []).map(t => {
        if ((t.category || 'Uncategorized') === oldName) {
          return { ...t, category: newName };
        }
        return t;
      });
    }
    return newTasks;
  });

  // Update enabled state
  setEnabledCategories(prev => {
    const out = { ...prev };
    if (prev[oldName] !== undefined) {
      out[newName] = prev[oldName];
      delete out[oldName];
    }
    return out;
  });

  // Update category colors
  setCategoryColors(prev => {
    const out = { ...prev };
    if (prev[oldName] !== undefined) {
      out[newName] = prev[oldName];
      delete out[oldName];
    }
    return out;
  });
}

/** Get sorted list of categories */
export function getCategories(enabledCategories) {
  return Object.keys(enabledCategories).sort();
}

/** Count tasks per category */
export function getCategoryCounts(tasks, getCategoryKeyForTask) {
  const counts = {};
  for (const dateKey of Object.keys(tasks || {})) {
    const arr = tasks[dateKey] || [];
    arr.forEach(t => {
      const c = getCategoryKeyForTask(t);
      counts[c] = (counts[c] || 0) + 1;
    });
  }
  return counts;
}

/** Get the color of a category */
export function getCategoryColor(categoryColors, cat) {
  return categoryColors[cat] || 'hsl(220 60% 60%)';
}

/** Set the color of a category */
export function setCategoryColor(setCategoryColors, cat, color) {
  setCategoryColors(prev => ({ ...prev, [cat]: color }));
}

/** Check if a category is enabled */
export function isCategoryEnabled(enabledCategories, cat) {
  return !!enabledCategories[cat];
}

/** Enable or disable a category */
export function setCategoryEnabled(setEnabledCategories, cat, enabled) {
  setEnabledCategories(prev => ({ ...prev, [cat]: !!enabled }));
}

/** Enable or disable all categories */
export function toggleAllCategories(setEnabledCategories, enabledCategories, enabled) {
  setEnabledCategories(prev => {
    const out = {};
    Object.keys(enabledCategories).forEach(k => (out[k] = !!enabled));
    return out;
  });
}
