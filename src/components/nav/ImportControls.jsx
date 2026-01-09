import React, { useRef, useState } from 'react';
import { csvToTasks } from '../../data/parseCsv.js';
import { useTaskStore } from '../../state/taskStore/index.jsx';
import CaseText from '../CaseText.jsx';

export default function ImportControls() {
  const fileInputRef = useRef(null);
  const [replace, setReplace] = useState(true);
  const [status, setStatus] = useState('');
  const { importTasks } = useTaskStore();

  function handleButtonClick() {
    // trigger the hidden file input
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
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

    e.target.value = ''; // reset so same file can be re-imported
  }

  return (
    <div className="import-controls" style={{ display: 'flex', gap: '0.5rem' }}>
      {/* Real button triggers hidden input */}
      <button className="btn" type="button" onClick={handleButtonClick}>
        <CaseText>Import CSV</CaseText>
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        accept=".csv,text/csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Replace toggle */}
      <div className="replace-toggle">
        <input
          type="checkbox"
          id="replace-checkbox"
          checked={replace}
          onChange={(e) => setReplace(e.target.checked)}
        />
        <label htmlFor="replace-checkbox"><CaseText>Replace Existing Tasks</CaseText></label>
      </div>

    </div>
  );
}
