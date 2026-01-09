// components/nav/FilterCompleted.jsx
import React from 'react';
import CaseText from '../CaseText.jsx';
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
    <CaseText>{showIncompleteOnly ? 'Incomplete Only' : 'All Tasks'}</CaseText>
    </button>
  );
}
