// AddTaskPanel.jsx
// Global task creation + editing panel

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../state/taskStore.jsx';

export default function AddTaskPanel({ className = "" }) {
  const {
    getCategories,
    addTask,
    addCategory,
    tasks,
    editingTask,
    saveTaskEdits,
    cancelEditTask
  } = useTaskStore();

  const categories = getCategories();

  const [text, setText] = useState('');
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
      setCategory(editingTask.task.category || '');
      setNewCategory('');
      setDate(editingTask.dateKey);
    } else {
      setText('');
      setCategory('');
      setNewCategory('');
      setDate('');
    }
  }, [editingTask]);

  // -----------------------------
  // CSV HELPERS
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
    const rows = [["date", "category", "text"]];

    for (const dateKey of Object.keys(tasksObj)) {
      const arr = tasksObj[dateKey] || [];
      arr.forEach((t) => {
        rows.push([
          dateKey,
          escapeCSV(t.category || ""),
          escapeCSV(t.description || "")
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

    if (isEditing) {
      saveTaskEdits(
        editingTask.dateKey,
        editingTask.taskId,
        {
          description: text.trim(),
          category: finalCategory || 'Uncategorized'
        }
      );
    } else {
      addTask(date, {
        text: text.trim(),
        category: finalCategory || 'Uncategorized'
      });
    }

    // Reset handled by useEffect when editingTask clears
  }

  return (
    <aside
      className={`add-task-panel-root ${className} ${isEditing ? 'edit-mode' : 'add-mode'}`}
      style={{ marginTop: '1rem' }}
    >
      <h3 style={{ marginBottom: '0.5rem' }}>
        {isEditing ? 'Edit Task' : 'Add Task'}
      </h3>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        {/* Task Text */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>
            Task Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">-- Select category --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__new__">➕ Create new category…</option>
          </select>

          {isCreatingNewCategory && (
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ marginTop: '0.25rem', width: '100%' }}
            />
          )}
        </div>

        {/* Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isEditing}
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          className="add-task-button"
          disabled={!text.trim() || !date}
        >
          {isEditing ? 'Save Changes' : 'Add Task'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={cancelEditTask}
            className="cancel-edit-button"
          >
            Cancel
          </button>
        )}
      </form>

      <button
        type="button"
        onClick={handleDownloadCSV}
        className="download-csv-button"
      >
        Download Tasks CSV
      </button>
    </aside>
  );
}
