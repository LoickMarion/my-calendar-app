// taskActions.js
import { normalizeTaskId } from './taskUtils';

/** Add a new task */
export function addTask(
  tasks,
  setTasks,
  setCompletedTasks,
  initializeCategories,
  dateKey,
  task
) {
  const arr = tasks[dateKey] || [];
  const index = arr.length;

  const category = (task.category && task.category.toString().trim()) || 'Uncategorized';
  const id = `task__${dateKey}__${category}__${index}`;

  const newTask = { id, category, description: task.text };

  // Update tasks
  const updatedTasks = { ...tasks, [dateKey]: [...arr, newTask] };
  setTasks(updatedTasks);

  // Mark new task as incomplete
  if (setCompletedTasks) {
    setCompletedTasks(prev => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] || {}), [id]: false }
    }));
  }

  // Update categories
  if (initializeCategories) initializeCategories(updatedTasks);
}

/** Delete a task */
export function deleteTask(tasks, setTasks, completedTasks, setCompletedTasks, dateKey, taskId) {
  const [__, idDate, category, indexStr] = taskId.split('__');
  const index = parseInt(indexStr, 10);

  const arr = tasks[dateKey] || [];
  const categoryTasks = arr.filter(t => t.category === category);
  const taskToDelete = categoryTasks[index];
  if (!taskToDelete) return;

  setTasks({ ...tasks, [dateKey]: arr.filter(t => t !== taskToDelete) });

  if (!completedTasks[dateKey]) return;
  const updatedDay = { ...completedTasks[dateKey] };
  delete updatedDay[taskId];
  setCompletedTasks({ ...completedTasks, [dateKey]: updatedDay });
}

/** Start editing a task */
export function startEditTask(tasks, setEditingTask, dateKey, taskId) {
    console.log('startEditTask called with:', dateKey, taskId);
  const [__, idDate, category, indexStr] = taskId.split('__');
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

/** Cancel editing */
export function cancelEditTask(setEditingTask) {
  setEditingTask(null);
}

/** Save edits to a task */
export function saveTaskEdits(tasks, setTasks, setEditingTask, dateKey, taskId, updates) {
  const [__, fromDateKey, category, indexStr] = taskId.split('__');
  const index = parseInt(indexStr, 10);

  const fromArr = tasks[fromDateKey] || [];
  const categoryTasks = fromArr.filter(t => t.category === category);
  const taskToUpdate = categoryTasks[index];
  if (!taskToUpdate) return;

  const updatedTask = { ...taskToUpdate, ...updates };

  if (fromDateKey !== dateKey) {
    const toArr = tasks[dateKey] || [];
    setTasks({
      ...tasks,
      [fromDateKey]: fromArr.filter(t => t !== taskToUpdate),
      [dateKey]: [...toArr, updatedTask],
    });
  } else {
    setTasks({
      ...tasks,
      [fromDateKey]: fromArr.map(t => (t === taskToUpdate ? updatedTask : t)),
    });
  }

  setEditingTask(null);
}

/** Reorder tasks within a day */
export function reorderTask(tasks, setTasks, dateKey, activeId, overId) {
  const [_, categoryA, indexA] = activeId.split('__');
  const [__, categoryB, indexB] = overId.split('__');
  const iA = parseInt(indexA, 10);
  const iB = parseInt(indexB, 10);

  const arr = tasks[dateKey] || [];
  const categoryTasks = arr.filter(t => t.category === categoryA);
  const task = categoryTasks[iA];
  if (!task) return;

  // Remove old
  let newArr = arr.filter(t => t !== task);

  // Insert at new index
  const before = newArr.filter(t => t.category === categoryB).slice(0, iB);
  const after = newArr.filter(t => t.category === categoryB).slice(iB);
  newArr = [...newArr.filter(t => t.category !== categoryB), ...before, task, ...after];

  setTasks({ ...tasks, [dateKey]: newArr });
}

/** Move a task within the same day */
export function moveTask(tasks, setTasks, dateKey, activeId, overId) {
  const [_, categoryA, indexA] = activeId.split('__');
  const [__, categoryB, indexB] = overId.split('__');
  const iA = parseInt(indexA, 10);
  const iB = parseInt(indexB, 10);

  const arr = tasks[dateKey] || [];
  if (categoryA !== categoryB) return; // only allow same-category moves

  const categoryTasks = arr.filter(t => t.category === categoryA);
  const task = categoryTasks[iA];
  if (!task) return;

  const newCategoryTasks = [...categoryTasks];
  newCategoryTasks.splice(iA, 1);
  newCategoryTasks.splice(iB, 0, task);

  // Rebuild array preserving order
  const newArr = [];
  arr.forEach(t => {
    if (t.category === categoryA) {
      if (!newArr.some(tt => tt.category === categoryA)) newArr.push(...newCategoryTasks);
    } else {
      newArr.push(t);
    }
  });

  setTasks({ ...tasks, [dateKey]: newArr });
}

/** Move a task to a different date */
export function moveTaskToDate(tasks, setTasks, completedTasks, setCompletedTasks, sourceDateKey, targetDateKey, taskId) {
  const [, category, indexStr] = taskId.split('__');
  const index = parseInt(indexStr, 10);

  const sourceArr = tasks[sourceDateKey] || [];
  const targetArr = tasks[targetDateKey] || [];

  const sourceCategoryTasks = sourceArr.filter(t => t.category === category);
  const taskToMove = sourceCategoryTasks[index];
  if (!taskToMove) return;

  const newSourceArr = sourceArr.filter(t => t !== taskToMove);
  const newTargetArr = [...targetArr, taskToMove];

  setTasks({
    ...tasks,
    [sourceDateKey]: newSourceArr,
    [targetDateKey]: newTargetArr,
  });

  // Move completion state
  const sourceCompleted = completedTasks[sourceDateKey] || {};
  const targetCompleted = completedTasks[targetDateKey] || {};
  if (!sourceCompleted[taskId]) return;

  const updatedSource = { ...sourceCompleted };
  delete updatedSource[taskId];

  setCompletedTasks({
    ...completedTasks,
    [sourceDateKey]: updatedSource,
    [targetDateKey]: { ...targetCompleted, [taskId.replace(sourceDateKey, targetDateKey)]: true },
  });
}
