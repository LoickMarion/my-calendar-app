// TaskList.jsx
// Renders a list of tasks grouped by category for a single day
// Uses SortableContext for drag-and-drop within the group

import React from 'react';
import { useTaskStore } from '../state/taskStore/index.jsx';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskItem from './SortableTaskItem.jsx';

export default function TaskList({ tasks = [], dateKey, mode = 'select' }) {
  const { getCategoryColor, isTaskComplete, showIncompleteOnly } = useTaskStore();

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
        {groupKeys.map((gk) => {
          const groupTasks = groups[gk];

          // Filter visible tasks for this group
          const visibleTasks = showIncompleteOnly
            ? groupTasks.filter((t, i) => {
                const id = `task__${dateKey}__${gk}__${i}`;
                return !isTaskComplete(dateKey, id);
              })
            : groupTasks;

          // Skip category if no visible tasks
          if (visibleTasks.length === 0) return null;

          return (
            <section key={gk} className="task-group">
              <div className="task-group-header">
                <h3
                  className="task-group-title"
                  style={{ background: getCategoryColor(gk) }}
                >
                  {gk}
                </h3>
                <span className="task-group-count">{visibleTasks.length}</span>
              </div>

              <SortableContext
                items={visibleTasks.map((t) => `${dateKey}__${gk}__${groupTasks.indexOf(t)}`)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="task-group-list">
                  {visibleTasks.map((t) => {
                    const i = groupTasks.indexOf(t); // original index
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
          );
        })}
      </div>
    </div>
  );
}
