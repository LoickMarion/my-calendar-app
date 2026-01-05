// TaskList.jsx
// Renders a simple list of tasks for a date. 

import React, { useState } from 'react';
import { useTaskStore } from '../state/taskStore.jsx';



export default function TaskList({ tasks = [] }) {
  // Normalize group key: prefer the task's title, then category. This treats "title" and "category" interchangeably.
  const groups = tasks.reduce((acc, t) => {
    const groupTitle = (t.title && t.title.toString().trim()) || (t.category && t.category.toString().trim()) || 'Untitled';
    if (!acc[groupTitle]) acc[groupTitle] = [];
    acc[groupTitle].push(t);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups);
  const { getCategoryColor } = useTaskStore();
  function getCategoryColorLocal(name) { return getCategoryColor(name); }
  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <p>No tasks for this date.</p>
      ) : (
        <div className="task-groups">
          {groupKeys.map((gk) => (
            <section key={gk} className="task-group">
              {/* Title appears once inside a rounded blue bubble */}
              <div className="task-group-header">
                <h3 className="task-group-title" style={{ background: getCategoryColorLocal(gk) }}>{gk}</h3>
                <span className="task-group-count">{groups[gk].length}</span>
              </div>

              {/* Plain bulleted list under the title bubble */}
              <ul className="task-group-list">
                {groups[gk].map((t, i) => {
                  const detail = (t.description && t.description.toString().trim()) || (t.notes && t.notes.toString().trim()) || '';
                  const line = detail || (t.title && t.title.toString().trim() !== gk ? t.title : '(no details)');
                    const id = `${gk}-${i}`;

                    // Local completion state per item
                    // We store checked values by a local state map keyed by group+index
                    // This is intentionally local UI state; persistence can be added later.
                    return (
                      <TaskListItem key={id} id={id} text={line} />
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

// Small subcomponent to handle an individual task's checkbox state and layout

function TaskListItem({ id, text }) {
  const [checked, setChecked] = useState(false);
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
          onChange={() => setChecked((v) => !v)}
          aria-label={`Mark ${text} as complete`}
        />
      </div>
    </li>
  );
}
