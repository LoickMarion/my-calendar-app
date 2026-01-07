// CalendarTile.jsx
// Droppable calendar day tile

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
    id: `day__${dateKey}`,
  });

  const classNames = ['calendar-tile'];

  if (!isCurrentMonth) classNames.push('muted');
  if (isSelected) classNames.push('selected');
  if (isOver) classNames.push('drag-over');

  const ariaLabel = `${date.toDateString()}${
    taskCount > 0 ? `: ${taskCount} incomplete tasks` : ''
  }`;

  return (
    <button
      ref={setNodeRef}
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
