import React from 'react';
import { useTaskStore } from '../state/taskStore/index.jsx';
import CaseText from '../components/CaseText.jsx';
import TaskList from './TaskList.jsx';
import { toLocalDateKey } from '../state/date.js';

export default function DayView({ mode = 'select' }) {
  const { selectedDate, getTasksForDate } = useTaskStore();

  if (!selectedDate) return <p>Please select a date.</p>;

  const dateKey = toLocalDateKey(selectedDate);

  const tasks = getTasksForDate(selectedDate);

  return (
    <aside className="day-view">
      <h2>
        <CaseText>
          {selectedDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          }).replace(',', ', ')}
        </CaseText>
      </h2>

      <TaskList tasks={tasks} dateKey={dateKey} mode={mode} />
    </aside>
  );
}
