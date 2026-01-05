// loadTasks.js
// Centralized task loader. By default it loads the local `tasks.json`.
// If you set VITE_SHEET_ID in a `.env` file, it will attempt to load tasks from a
// public Google Sheet (read-only) using the `loadFromGoogleSheet` helper.

import tasks from './tasks.json';
import { loadFromGoogleSheet } from './loadFromGoogleSheet';

export function loadTasks() {
  const sheetId = import.meta.env.VITE_SHEET_ID;
  const sheetName = import.meta.env.VITE_SHEET_NAME;

  if (sheetId) {
    // Returns a Promise that resolves to the tasks object in the same format as tasks.json
    return loadFromGoogleSheet(sheetId, sheetName);
  }

  return tasks;
}

export default loadTasks;
