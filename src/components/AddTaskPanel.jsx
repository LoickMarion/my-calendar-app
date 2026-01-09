// AddTaskPanel.jsx
// Global task creation + editing panel

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../state/taskStore/index.jsx';
import CaseText from './CaseText.jsx';

export default function AddTaskPanel({ className = "" }) {
  const {
    getCategories,
    addTask,
    addCategory,
    tasks,
    editingTask,
    saveTaskEdits,
    cancelEditTask,
    moveTaskToDate
  } = useTaskStore();

  const categories = getCategories();

  const [text, setText] = useState('');
  const [title, setTitle] = useState(''); // NEW FIELD
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [date, setDate] = useState('');

  const isCreatingNewCategory = category === '__new__';
  const isEditing = Boolean(editingTask);

  // -----------------------------
  // SYNC FORM WHEN EDITING
  // -----------------------------
  useEffect(() => {
    if (editingTask) {
      setText(editingTask.task.description || '');
      setTitle(editingTask.task.title || editingTask.task.description || ''); // NEW FIELD
      setCategory(editingTask.task.category || '');
      setNewCategory('');
      setDate(editingTask.dateKey);
    } else {
      setText('');
      setTitle(''); // NEW FIELD
      setCategory('');
      setNewCategory('');
      setDate('');
    }
  }, [editingTask]);

  // -----------------------------
  // CSV HELPERS (unchanged)
  // -----------------------------
  function escapeCSV(value) {
    if (value == null) return "";
    const str = value.toString();
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function tasksToCSV(tasksObj) {
    const rows = [["date", "category", "title", "text", "completed"]]; // UPDATED HEADER

    for (const dateKey of Object.keys(tasksObj)) {
      const arr = tasksObj[dateKey] || [];
      arr.forEach((t) => {
        rows.push([
          dateKey,
          escapeCSV(t.category || ""),
          escapeCSV(t.title || ""),
          escapeCSV(t.description || ""),
          t.completed ? "true" : "false",
        ]);
      });
    }

    return rows.map((r) => r.join(",")).join("\n");
  }

  function downloadCSV(csvString, filename = "tasks.csv") {
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  function handleDownloadCSV() {
    const csv = tasksToCSV(tasks);
    downloadCSV(csv);
  }

  // -----------------------------
  // SUBMIT HANDLER (ADD vs EDIT)
  // -----------------------------
  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || !date) return;

    let finalCategory = category;

    if (isCreatingNewCategory && newCategory.trim()) {
      finalCategory = newCategory.trim();
      addCategory(finalCategory);
    }

    const taskData = {
      description: text.trim(),
      title: title.trim() || text.trim(), // NEW FIELD
      category: finalCategory || 'Uncategorized',
      completed: editingTask?.task.completed || false, // preserve completed status
    };

    if (isEditing) {
      const fromDateKey = editingTask.dateKey;
      const toDateKey = date;
      const taskId = editingTask.taskId;

      // Date changed → move task first
      if (fromDateKey !== toDateKey) {
        moveTaskToDate(fromDateKey, toDateKey, taskId);

        // Then edit the task on the NEW date
        saveTaskEdits(toDateKey, taskId, taskData);
      } else {
        // Same date → simple edit
        saveTaskEdits(fromDateKey, taskId, taskData);
      }
    } else {
      // Create new task
      addTask(date, taskData);
    }
  }

  return (
    <aside
      className={`add-task-panel-root ${className} ${isEditing ? 'edit-mode' : 'add-mode'}`}
    >
      <h3>
        <CaseText>{isEditing ? 'Edit Task' : 'Add Task'}</CaseText>
      </h3>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column'}}
      >
        {/* Task Title (NEW FIELD) */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <CaseText>Task Title</CaseText>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="task-input"
          />
        </div>

        {/* Task Text */}
        <div>
          <label style={{ display: 'block', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <CaseText>Task Text</CaseText>
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            className="task-input"
          />
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', marginTop: '0.5rem',marginBottom: '0.5rem' }}>
            <CaseText>Category</CaseText>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="task-input"
          >
            <option value=""> <CaseText>-- Select category --</CaseText></option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="__new__"><CaseText>➕ Create new category…</CaseText></option>
          </select>

          {isCreatingNewCategory && (
            <input
              type="text"
              placeholder={<CaseText>New category name</CaseText>}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="task-input"
              style={{ marginTop: '0.25rem' }}
            />
          )}
        </div>

        {/* Date */}
        <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <CaseText>Date</CaseText>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="task-input"
          />
        </div>

        <button
          type="submit"
          className="btn"
          disabled={!text.trim() || !date}
        >
          <CaseText>{isEditing ? 'Save Changes' : 'Add Task'}</CaseText>
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={cancelEditTask}
            className="btn"
            style={{ marginTop: '0.5rem' }}
          >
            <CaseText>Cancel</CaseText>
          </button>
        )}
      </form>

      <button
        type="button"
        onClick={handleDownloadCSV}
        className="btn"
        style={{ marginTop: '0.5rem' }}
      >
        <CaseText>Download Tasks CSV</CaseText>
      </button>
    </aside>
  );
}
