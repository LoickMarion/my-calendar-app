// TaskItem.jsx
// Draggable task row with select / delete / edit modes

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useTaskStore } from '../state/taskStore/index.jsx';

export default function TaskItem({ task, id, mode = 'select' }) {
  const {
    toggleTaskComplete,
    deleteTask,
    startEditTask
  } = useTaskStore();

  const draggableId = `${id}`;
  const dateKey = id.split('__')[1];

const { attributes, listeners, setNodeRef, transform, isDragging } =
  useDraggable({
    id: draggableId,
    disabled: false,
    data: { noDrag: true }
  });

  const checked = task.completed;

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
        data-no-drag
        onChange={() =>  {
            console.log('Checkbox clicked for task:', id);
            toggleTaskComplete(dateKey, id);}}
        />
    );
  } else if (mode === 'delete') {
    actionBox = (
        <button
        type="button"
        className="task-action-delete"
        data-no-drag
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
        data-no-drag
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
        className={`task-list-item ${checked ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
        >
        {/* ROW 1 */}
        <div className="task-row-top">
            <div className="task-title">
            {task.title}
            </div>

            <div className="task-right">
            {actionBox}
            </div>
        </div>

        {/* ROW 2 */}
        {task.description && (
            <div className="task-description">
            {task.description}
            </div>
        )}
        </li>


    );

}
