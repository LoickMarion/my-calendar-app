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
    <div className="import-controls" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <label className="file-label">
        <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        <span className="file-button">Choose file</span>
      </label>
      <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', fontSize: '0.9rem' }}>
        <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
        <span>Replace existing tasks & categories</span>
      </label>
      <div className="import-status" aria-live="polite" style={{ fontSize: '0.85rem', color: '#555' }}>{status}</div>
    </div>
  );
}
