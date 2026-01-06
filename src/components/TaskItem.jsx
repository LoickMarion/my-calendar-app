// TaskItem.jsx
// Renders a single task row with select, delete, and edit modes
// Supports dynamic IDs for delete and edit

import React from 'react';
import { useTaskStore } from '../state/taskStore.jsx';

export default function TaskItem({ id, text, dateKey, mode = 'select' }) {
  const {
    toggleTaskComplete,
    isTaskComplete,
    deleteTask,
    startEditTask, // <-- use this for edit mode
  } = useTaskStore();

  const checked = isTaskComplete(dateKey, id);

  // Determine right-hand "action box" based on mode
  let actionBox = null;

  if (mode === 'select') {
    actionBox = (
      <input
        type="checkbox"
        className="task-check"
        checked={checked}
        onChange={() => toggleTaskComplete(dateKey, id)}
        aria-label={`Mark ${text} as complete`}
      />
    );
  } else if (mode === 'delete') {
    actionBox = (
      <button
        type="button"
        onClick={() => deleteTask(dateKey, id)}
        className="task-action-delete"
        aria-label={`Delete ${text}`}
      >
        ✕
      </button>
    );
  } else if (mode === 'edit') {
    actionBox = (
      <button
        type="button"
        className="task-action-edit"
        onClick={() => startEditTask(dateKey, id)}
        aria-label={`Edit ${text}`}
      >
        ✎
      </button>
    );
  }

  return (
    <li className={`task-list-item ${checked ? 'completed' : ''}`}>
      <div className="task-left">
        <span className="bullet">•</span>
        <span className="task-title">{text}</span>
      </div>
      <div className="task-right">{actionBox}</div>
    </li>
  );
}
