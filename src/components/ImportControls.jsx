// ImportControls.jsx
// UI controls for importing tasks from a CSV file.
// - Accepts a CSV with a header row (must include `date` column)
// - Optional 'Replace existing tasks' checkbox

import React, { useState } from 'react';
import { csvToTasks } from '../data/parseCsv';
import { useTaskStore } from '../state/taskStore.jsx';

export default function ImportControls() {
  const [status, setStatus] = useState('');
  // Default to true so importing a CSV replaces previous tasks and categories (avoids stale categories)
  const [replace, setReplace] = useState(true);
  const { importTasks } = useTaskStore();

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        const newTasks = csvToTasks(text);
        const dateCount = Object.keys(newTasks).length;
        if (dateCount === 0) {
          setStatus('No tasks found in CSV');
          return;
        }
        importTasks(newTasks, { replace });
        const taskCount = Object.values(newTasks).reduce((s, a) => s + a.length, 0);
        setStatus(`Imported ${taskCount} tasks across ${dateCount} dates`);
      } catch (err) {
        console.error(err);
        setStatus('Failed to parse CSV: ' + err.message);
      }
    };
    reader.onerror = () => setStatus('Failed to read file');
    reader.readAsText(file);

    // reset the input so the same file can be re-imported if needed
    e.target.value = '';
  }

  return (
  <div className="import-controls">
    {/* File picker container */}
    <div className="file-picker">
      <label className="btn file-button">
        Choose file
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
        />
      </label>
    </div>

    {/* Checkbox container */}
    <div className="replace-toggle">
      <input
        type="checkbox"
        id="replace-checkbox"
        checked={replace}
        onChange={(e) => setReplace(e.target.checked)}
      />
      <label htmlFor="replace-checkbox">Replace existing tasks & categories</label>
    </div>
  </div>

  );
}
