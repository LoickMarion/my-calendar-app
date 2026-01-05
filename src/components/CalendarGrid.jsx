// CalendarGrid.jsx
// Renders a 7x6 month grid. Uses CalendarTile for each day.

import React from 'react';
import CalendarTile from './CalendarTile';
import { useTaskStore } from '../state/taskStore.jsx';

export default function CalendarGrid({ year, month, onSelectDate, selectedDate }) {
  const { tasks, isTaskComplete, isCategoryEnabled } = useTaskStore();

  const getGroupTitle = (t) =>
    (t.title && t.title.toString().trim()) ||
    (t.category && t.category.toString().trim()) ||
    'Untitled';

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const tiles = [];
  let dayCounter = 1 - startWeekday;

  const selectedKey = selectedDate
    ? selectedDate.toISOString().slice(0, 10)
    : null;

  for (let row = 0; row < 6; row++) {
    const week = [];

    for (let col = 0; col < 7; col++) {
      const d = new Date(year, month, dayCounter);
      const dateKey = d.toISOString().slice(0, 10);
      const isCurrentMonth = d.getMonth() === month;

      const allTasksForDate = tasks[dateKey] || [];

      // Rebuild the same groups TaskList uses
      const groups = allTasksForDate.reduce((acc, t) => {
        const groupTitle = getGroupTitle(t);
        if (!acc[groupTitle]) acc[groupTitle] = [];
        acc[groupTitle].push(t);
        return acc;
      }, {});

      const groupKeys = Object.keys(groups);

      // Walk tasks in the same order and build deterministic IDs
      const allTasksWithIds = [];
      groupKeys.forEach((gk) => {
        groups[gk].forEach((t, i) => {
          const id = `${dateKey}__${gk}__${i}`;
          allTasksWithIds.push({ t, id, groupTitle: gk });
        });
      });

      const visibleTasks = allTasksWithIds.filter(({ t, groupTitle }) =>
        isCategoryEnabled(
          (t.category && t.category.toString().trim()) ||
            groupTitle ||
            'Uncategorized'
        )
      );

      const incompleteTasks = visibleTasks.filter(
        ({ id }) => !isTaskComplete(dateKey, id)
      );

      const taskCount = incompleteTasks.length;
      const hasTasks = visibleTasks.length > 0;
      const allComplete = hasTasks && taskCount === 0;

      const isSelected = selectedKey === dateKey;

      week.push(
        <CalendarTile
          key={d.toISOString()}
          date={d}
          isCurrentMonth={isCurrentMonth}
          isSelected={isSelected}
          taskCount={taskCount}
          allComplete={allComplete}
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
      <div className="calendar-header-row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
          <div key={label} className="calendar-header-cell">
            {label}
          </div>
        ))}
      </div>

      {tiles}
    </section>
  );
}
