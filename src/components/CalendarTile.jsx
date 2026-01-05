// CalendarTile.jsx
// Represents a single day tile in the calendar grid.
// Props:
// - date: Date object
// - onClick(date): callback when tile is clicked
// - isCurrentMonth: boolean indicating the tile belongs to the displayed month

import React from 'react';

export default function CalendarTile({
  date,
  onClick,
  isCurrentMonth = true,
  isSelected = false,
  taskCount = 0,
  allComplete = false
}) {
  const classes = ['calendar-tile'];
  if (!isCurrentMonth) classes.push('muted');
  if (isSelected) classes.push('selected');

  const ariaLabel = `${date.toDateString()}${
    taskCount > 0 ? `: ${taskCount} incomplete tasks` : ''
  }`;

  return (
    <button
      className={classes.join(' ')}
      onClick={() => onClick(date)}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
    >
      <div className="date-number">{date.getDate()}</div>

      {allComplete ? (
        <div className="task-complete-x" aria-hidden>
          ✕
        </div>
      ) : taskCount > 0 ? (
        <div className="task-badge" aria-hidden>
          {taskCount}
        </div>
      ) : null}
    </button>
  );
}
