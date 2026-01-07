// TaskItem.jsx
// Draggable task row with select / delete / edit modes

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useTaskStore } from '../state/taskStore.jsx';

export default function TaskItem({ id, text, dateKey, mode = 'select' }) {
  const {
    toggleTaskComplete,
    isTaskComplete,
    deleteTask,
    startEditTask
  } = useTaskStore();

//   console.log('DateKey:', dateKey, 'Task ID:', id);
  const draggableId = `${id}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId
  });

  const checked = isTaskComplete(dateKey, id);

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 1000
      }
    : undefined;

  let actionBox = null;
  if (mode === 'select') {
    actionBox = (
      <input
        type="checkbox"
        className="task-check"
        checked={checked}
        onChange={() => toggleTaskComplete(dateKey, id)}
      />
    );
  } else if (mode === 'delete') {
    actionBox = (
      <button
        type="button"
        className="task-action-delete"
        onClick={() => deleteTask(dateKey, id)}
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
      >
        ✎
      </button>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-list-item ${checked ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="task-left">
        <span className="bullet">•</span>
        <span className="task-title">{text}</span>
      </div>
      <div className="task-right">{actionBox}</div>
    </li>
  );
}
