// CalendarTile.jsx
// Droppable calendar day tile with drag-over highlighting

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function CalendarTile({
  date,
  dateKey,
  onClick,
  isCurrentMonth = true,
  isSelected = false,
  taskCount = 0,
  allComplete = false,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day__${dateKey}`, // unique ID for DnD
  });

  const classNames = ['calendar-tile'];

  if (!isCurrentMonth) classNames.push('muted');
  if (isSelected) classNames.push('selected');
  if (isOver) classNames.push('drag-over'); // highlight when dragging over

  const ariaLabel = `${date.toDateString()}${
    taskCount > 0 ? `: ${taskCount} incomplete tasks` : ''
  }`;

  return (
    <button
      ref={setNodeRef} // make droppable
      type="button"
      className={classNames.join(' ')}
      onClick={() => onClick(date)}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
    >
      <div className="date-number">{date.getDate()}</div>

      {allComplete ? (
        <div className="task-complete-x" aria-hidden="true">
          ✕
        </div>
      ) : taskCount > 0 ? (
        <div className="task-badge" aria-hidden="true">
          {taskCount}
        </div>
      ) : null}
    </button>
  );
}
