// TaskList.jsx
// Renders a simple list of tasks for a date.
import React from 'react';
import { useTaskStore } from '../state/taskStore.jsx';

export default function TaskList({ tasks = [], dateKey }) {
  const { getCategoryColor } = useTaskStore();

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

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <p>No tasks for this date.</p>
      ) : (
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

                  const line =
                    detail ||
                    (t.description && t.description.toString().trim()) || '(no text)';

                  // Deterministic ID: dateKey + groupTitle + index
                  const id = `${dateKey}__${gk}__${i}`;

                  return (
                    <TaskListItem
                      key={id}
                      id={id}
                      text={line}
                      dateKey={dateKey}
                    />
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskListItem({ id, text, dateKey }) {
  const { toggleTaskComplete, isTaskComplete } = useTaskStore();

  const checked = isTaskComplete(dateKey, id);

  return (
    <li className={`task-list-item ${checked ? 'completed' : ''}`} key={id}>
      <div className="task-left">
        <span className="bullet">•</span>
        <span className="task-title">{text}</span>
      </div>
      <div className="task-right">
        <input
          type="checkbox"
          className="task-check"
          checked={checked}
          onChange={() => {toggleTaskComplete(dateKey, id);}}
          aria-label={`Mark ${text} as complete`}
        />
      </div>
    </li>
  );
}
