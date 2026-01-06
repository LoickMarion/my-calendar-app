import React from 'react';
import TaskList from './TaskList';
import { useTaskStore } from '../state/taskStore.jsx';

export default function DayView({ mode = 'select' }) {
  const { selectedDate, getTasksForDate } = useTaskStore();

  if (!selectedDate) {
    return (
      <aside className="day-view">
        <p>Select a date to view tasks.</p>
      </aside>
    );
  }

  const tasks = getTasksForDate(selectedDate);
  const dateKey = selectedDate.toISOString().slice(0, 10);

  return (
    <aside className="day-view">
      <h2>
        {selectedDate.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </h2>

      <TaskList tasks={tasks} dateKey={dateKey} mode={mode} />
    </aside>
  );
}
