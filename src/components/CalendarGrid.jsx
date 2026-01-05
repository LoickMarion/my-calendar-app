// CalendarGrid.jsx
// Renders a 7x6 month grid. Uses CalendarTile for each day.

import React from 'react';
import CalendarTile from './CalendarTile';

export default function CalendarGrid({ year, month, onSelectDate, selectedDate, tasks = {} }) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const tiles = [];
  let dayCounter = 1 - startWeekday;

  const selectedKey = selectedDate ? selectedDate.toISOString().slice(0, 10) : null;

  for (let row = 0; row < 6; row++) {
    const week = [];
    for (let col = 0; col < 7; col++) {
      const d = new Date(year, month, dayCounter);
      const isCurrentMonth = d.getMonth() === month;
      const dateKey = d.toISOString().slice(0, 10);
      const taskCount = (tasks[dateKey] || []).length;
      const isSelected = selectedKey === dateKey;

      week.push(
        <CalendarTile
          key={d.toISOString()}
          date={d}
          isCurrentMonth={isCurrentMonth}
          isSelected={isSelected}
          taskCount={taskCount}
          onClick={(date) => isCurrentMonth && onSelectDate(date)}
        />
      );

      dayCounter++;
    }

    tiles.push(
      <div key={row} className="calendar-row">
        {week}
      </div>
    );
  }

  return (
    <section className="calendar-grid" role="grid" aria-label="Month">
      {/* Weekday header row */}
      <div className="calendar-header-row">
        {weekdayLabels.map((label) => (
          <div key={label} className="calendar-header-cell">
            {label}
          </div>
        ))}
      </div>

      {tiles}
    </section>
  );
}
