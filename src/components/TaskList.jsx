// TaskList.jsx
// Renders a list of tasks for a date, grouped by title/category, using TaskItem.jsx.

import React from 'react';
import { useTaskStore } from '../state/taskStore.jsx';
import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks = [], dateKey, mode = 'select' }) {
  const { getCategoryColor, deleteTask } = useTaskStore();

  // Group tasks by title or category
  const groups = tasks.reduce((acc, t) => {
    const groupTitle =
      (t.title && t.title.toString().trim()) ||
      (t.category && t.category.toString().trim()) ||
      'Untitled';

    if (!acc[groupTitle]) acc[groupTitle] = [];
    acc[groupTitle].push(t);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups);

  if (tasks.length === 0) {
    return <p>No tasks for this date.</p>;
  }

  return (
    <div className="task-list">
      <div className="task-groups">
        {groupKeys.map((gk) => (
          <section key={gk} className="task-group">
            <div className="task-group-header">
              <h3
                className="task-group-title"
                style={{ background: getCategoryColor(gk) }}
              >
                {gk}
              </h3>
              <span className="task-group-count">{groups[gk].length}</span>
            </div>

            <ul className="task-group-list">
              {groups[gk].map((t, i) => {
                const detail =
                  (t.description && t.description.toString().trim()) ||
                  (t.notes && t.notes.toString().trim()) ||
                  '';
                const line = detail || '(no text)';

                // Deterministic ID for the task
                const id = `${dateKey}__${gk}__${i}`;

                return (
                  <TaskItem
                    key={id}
                    id={id}
                    text={line}
                    dateKey={dateKey}
                    mode={mode}
                    onDelete={() => deleteTask(dateKey, id)}
                  />
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
