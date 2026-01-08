// components/nav/FilterCompleted.jsx
import React from 'react';

import { useTaskStore } from '../../state/taskStore/index.jsx';

export default function FilterCompleted() {
  const { showIncompleteOnly, toggleShowIncompleteOnly } = useTaskStore();

  return (
    <button
    className={`btn ${showIncompleteOnly ? 'active' : ''}`}
    onClick={toggleShowIncompleteOnly}
    aria-pressed={showIncompleteOnly}
    style={{ width: '130px', textAlign: 'center' }}
    >
    {showIncompleteOnly ? 'Incomplete Only' : 'All Tasks'}
    </button>
  );
}
