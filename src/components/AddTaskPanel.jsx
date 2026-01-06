// AddTaskPanel.jsx
// Global task creation panel to sit under CategoriesFilter.
// Uses: category, date, and task text (stored as description).

import React, { useState } from 'react';
import { useTaskStore } from '../state/taskStore.jsx';

export default function AddTaskPanel() {
  const {
    getCategories,
    addTask,
    addCategory,
    tasks, // <-- needed for CSV export
  } = useTaskStore();

  const categories = getCategories();

  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [date, setDate] = useState('');

  const isCreatingNewCategory = category === '__new__';

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
  // ADD TASK HANDLER
  // -----------------------------
  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || !date) return;

    const dateKey = date; // input type="date" gives YYYY-MM-DD

    let finalCategory = category;

    // If user is creating a new category
    if (isCreatingNewCategory && newCategory.trim()) {
      finalCategory = newCategory.trim();
      addCategory(finalCategory);
    }

    addTask(dateKey, {
      text: text.trim(),
      category: finalCategory || 'Uncategorized',
    });

    // Reset form
    setText('');
    setCategory('');
    setNewCategory('');
    setDate('');
  }

  return (
    <aside className="add-task-panel" style={{ marginTop: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Add Task</h3>

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
            style={{ width: '100%' }}
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={!text.trim() || !date}>
          Add Task
        </button>
      </form>
      
      <button
        type="button"
        onClick={handleDownloadCSV}
        style={{ marginTop: '1rem' }}
      >
        Download Tasks CSV
      </button>
    </aside>
  );
}
