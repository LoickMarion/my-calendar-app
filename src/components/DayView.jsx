// DayView.jsx
// Displays tasks for the currently selected date.
// This is a placeholder UI that uses TaskList to render tasks.

import React from 'react';
import TaskList from './TaskList';
import { useTaskStore } from '../state/taskStore.jsx';

export default function DayView() {
  const { selectedDate, getTasksForDate } = useTaskStore();

  if (!selectedDate) {
    return (
      <aside className="day-view">
        <p>Select a date to view tasks.</p>
      </aside>
    );
  }

  const tasks = getTasksForDate(selectedDate);

  return (
    <aside className="day-view">
      <h2>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
      <TaskList tasks={tasks} />
    </aside>
  );
}
