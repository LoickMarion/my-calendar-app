import React from 'react';
import { useTaskStore } from '../state/taskStore.jsx';
import TaskList from './TaskList.jsx';

export default function DayView({ mode = 'select' }) {
  const { selectedDate, getTasksForDate } = useTaskStore();

  if (!selectedDate) return <p>Please select a date.</p>;

  const dateKey = selectedDate.toISOString().slice(0, 10);
  const tasks = getTasksForDate(selectedDate);

  return (
    <aside className="day-view">
      <h2>
        {selectedDate.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }).replace(',', ', ')}
      </h2>

      <TaskList tasks={tasks} dateKey={dateKey} mode={mode} />
    </aside>
  );
}
