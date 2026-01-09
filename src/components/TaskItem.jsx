// TaskItem.jsx
// Draggable task row with select / delete / edit modes

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useTaskStore } from '../state/taskStore/index.jsx';
import { useThemeStore } from '../state/themeStore.jsx';
import { SVG_BULLETS } from './nav/theme/CustomBulletPointsSVGs.jsx';

export default function TaskItem({ task, id, mode = 'select' }) {
  const { toggleTaskComplete, deleteTask, startEditTask } = useTaskStore();
  const { theme } = useThemeStore();

  // ---------- Bullet component ----------
  const DefaultBullet = () => (
    <span
      style={{
        display: 'inline-block',
        width: '0.5em',
        height: '0.5em',
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        marginRight: '0.4em',
      }}
    />
  );

  // Determine which bullet to render
  const selectedBulletKey = theme['bullet-svg'];
  const BulletIcon = selectedBulletKey
    ? () => {
        const bulletData = SVG_BULLETS[selectedBulletKey];
        // If string (data URL), render as <img>, else assume it's a React component
        if (typeof bulletData === 'string') {
          return (
            <img
              src={bulletData}
              className="task-bullet-icon"
              style={{
                width: theme['bullet-svg-size'],
                height: theme['bullet-svg-size'],
                marginRight: theme['bullet-svg-spacing'],
              }}
            />
          );
        } else if (typeof bulletData === 'function') {
          const Component = bulletData;
          return (
            <Component
              className="task-bullet-icon"
              style={{
                width: theme['bullet-svg-size'],
                height: theme['bullet-svg-size'],
                marginRight: theme['bullet-svg-spacing'],
                fill: theme['bullet-svg-color'],
              }}
            />
          );
        } else {
          return <DefaultBullet />;
        }
      }
    : DefaultBullet;

  // ---------- Draggable setup ----------
  const draggableId = `${id}`;
  const dateKey = id.split('__')[1];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    disabled: false,
    data: { noDrag: true },
  });

  const checked = task.completed;

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 1000,
      }
    : undefined;

  // ---------- Action buttons ----------
  let actionBox = null;
  if (mode === 'select') {
    actionBox = (
      <label className="checkbox-wrapper">
        <input
          type="checkbox"
          checked={checked}
          data-no-drag
          onChange={() => toggleTaskComplete(dateKey, id)}
        />
        <span className="checkbox-custom" />
      </label>
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

  // ---------- Render ----------
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`task-list-item ${checked ? 'completed' : ''} ${
        isDragging ? 'dragging' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      {/* ROW 1 */}
      <div className="task-row-top">
        <div className="task-title">
          <BulletIcon />
          {task.title}
        </div>
        <div className="task-right">{actionBox}</div>
      </div>

      {/* ROW 2 */}
      {task.description && <div className="task-description">{task.description}</div>}
    </li>
  );
}
