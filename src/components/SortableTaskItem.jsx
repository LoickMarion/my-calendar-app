// SortableTaskItem.jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskItem from './TaskItem.jsx';

export default function SortableTaskItem({ id, text, dateKey, mode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: 'grab',
    zIndex: isDragging ? 999 : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem id={id} text={text} dateKey={dateKey} mode={mode} />
    </div>
  );
}
