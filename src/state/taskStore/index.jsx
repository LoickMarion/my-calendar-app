import React, { createContext, useContext } from "react";
import { useTaskState } from "./useTaskState";

import * as taskActions from "./taskActions";
import * as taskUtils from "./taskUtils";
import * as categoryActions from "./categoryActions";
import * as csvActions from "./csvActions";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const state = useTaskState();

  const store = {
    ...state,

    // --- Task actions ---
    addTask: (dateKey, task) =>
    taskActions.addTask(
        state.tasks,
        state.setTasks,
        state.initializeCategories, 
        dateKey,
        task
    ),


    deleteTask: (dateKey, taskId) =>
      taskActions.deleteTask(
        state.tasks,
        state.setTasks,
        dateKey,
        taskId
      ),

    startEditTask: (dateKey, taskId) =>
      taskActions.startEditTask(state.tasks, state.setEditingTask, dateKey, taskId),

    cancelEditTask: () => taskActions.cancelEditTask(state.setEditingTask),

    saveTaskEdits: (dateKey, taskId, updates) =>
    taskActions.saveTaskEdits(
        state.tasks,
        state.setTasks,
        state.setEditingTask,
        dateKey,
        taskId,
        updates
    ),


    reorderTask: (dateKey, activeId, overId) =>
      taskActions.reorderTask(state.tasks, state.setTasks, dateKey, activeId, overId),

    moveTask: (dateKey, activeId, overId) =>
      taskActions.moveTask(state.tasks, state.setTasks, dateKey, activeId, overId),

    moveTaskToDate: (sourceDateKey, targetDateKey, taskId) =>
      taskActions.moveTaskToDate(
        state.tasks,
        state.setTasks,
        sourceDateKey,
        targetDateKey,
        taskId
      ),

    importTasks: state.importTasks, // <-- updated

    // --- Category actions ---
    addCategory: cat =>
      categoryActions.addCategory(state.setEnabledCategories, state.setCategoryColors, cat),

    deleteCategory: cat =>
      categoryActions.deleteCategory(
        state.setTasks,
        state.setEnabledCategories,
        state.setCategoryColors,
        cat
      ),

    renameCategory: (oldName, newName) =>
      categoryActions.renameCategory(
        state.tasks,
        state.setTasks,
        state.enabledCategories,
        state.setEnabledCategories,
        state.categoryColors,
        state.setCategoryColors,
        oldName,
        newName
      ),

    getCategories: () => categoryActions.getCategories(state.enabledCategories),
    getCategoryCounts: () =>
      categoryActions.getCategoryCounts(state.tasks, taskUtils.getCategoryKeyForTask),

    getCategoryColor: cat => categoryActions.getCategoryColor(state.categoryColors, cat),
    setCategoryColor: (cat, color) =>
      categoryActions.setCategoryColor(state.setCategoryColors, cat, color),

    isCategoryEnabled: cat =>
      categoryActions.isCategoryEnabled(state.enabledCategories, cat),

    setCategoryEnabled: (cat, enabled) =>
      categoryActions.setCategoryEnabled(state.setEnabledCategories, cat, enabled),

    toggleAllCategories: enabled =>
      categoryActions.toggleAllCategories(
        state.setEnabledCategories,
        state.enabledCategories,
        enabled
      ),

    // --- Task utils ---
    toggleTaskComplete: (dateKey, taskId) =>
      taskUtils.toggleTaskComplete(
        state.setTasks,
        dateKey,
        taskId
      ),



    getTasksForDate: date =>
      taskUtils.getTasksForDate(state.tasks, state.enabledCategories, date),

    getFilteredTasks: () =>
      taskUtils.getFilteredTasks(state.tasks, state.enabledCategories),

    addDeterministicIds: taskUtils.addDeterministicIds,
    getCategoryKeyForTask: taskUtils.getCategoryKeyForTask,

    // --- CSV ---
    tasksToCSV: csvActions.tasksToCSV,
    escapeCSV: csvActions.escapeCSV,
  };

  return <TaskContext.Provider value={store}>{children}</TaskContext.Provider>;
}

export function useTaskStore() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskStore must be used within a TaskProvider");
  return ctx;
}
