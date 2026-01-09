import React from 'react';
import { useTaskStore } from '../state/taskStore/index.jsx';
import CaseText from '../components/CaseText.jsx';
import TaskList from './TaskList.jsx';
import CelebrationManager from './celebration/CelebrationManager.jsx';
import { toLocalDateKey } from '../state/date.js';

export default function DayView({ mode = 'select' }) {
  const { selectedDate, getTasksForDate } = useTaskStore();

  // No date selected
  if (!selectedDate) {
    return <p><CaseText>Please select a date.</CaseText></p>;
  }

  const dateKey = toLocalDateKey(selectedDate);
  const tasks = getTasksForDate(selectedDate);

  // ⭐ Compute whether all tasks for this day are complete
  const allDone =
    tasks.length > 0 &&
    tasks.every(task => task.completed === true);

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

      {/* ⭐ Trigger celebration when all tasks are complete */}
      <CelebrationManager allDone={allDone} />

      {/* Render the tasks */}
      <TaskList tasks={tasks} dateKey={dateKey} mode={mode} />
    </aside>
  );
}
