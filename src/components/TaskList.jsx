// TaskList.jsx
// Renders a list of tasks grouped by category for a single day
// Uses SortableContext for drag-and-drop within the group

import React from 'react';
import { useTaskStore } from '../state/taskStore.jsx';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskItem from './SortableTaskItem.jsx';

export default function TaskList({ tasks = [], dateKey, mode = 'select' }) {
  const { getCategoryColor } = useTaskStore();

  // Group tasks by category
  const groups = tasks.reduce((acc, t) => {
    const groupTitle = (t.category && t.category.toString().trim()) || 'Uncategorized';
    if (!acc[groupTitle]) acc[groupTitle] = [];
    acc[groupTitle].push(t);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups);

  return (
    <div className="task-list">
      <div className="task-groups">
        {groupKeys.map((gk) => (
          <section key={gk} className="task-group">
            <div className="task-group-header">
              <h3 className="task-group-title" style={{ background: getCategoryColor(gk) }}>
                {gk}
              </h3>
              <span className="task-group-count">{groups[gk].length}</span>
            </div>

            <SortableContext
              items={groups[gk].map((t, i) => `${dateKey}__${gk}__${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="task-group-list">
                {groups[gk].map((t, i) => {
                  const id = `task__${dateKey}__${gk}__${i}`;
                  return (
                    <SortableTaskItem
                      key={id}
                      id={id}
                      text={t.description || '(no text)'}
                      dateKey={dateKey}
                      mode={mode}
                    />
                  );
                })}
              </ul>
            </SortableContext>
          </section>
        ))}
      </div>
    </div>
  );
}
