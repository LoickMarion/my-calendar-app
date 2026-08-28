// AddTaskPanel.jsx
// Global task creation + editing panel

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../state/taskStore/index.jsx';
import { saveTasksToDrive } from '../data/googleDriveTasks.js';
import { clampEndDate, MAX_RECURRENCE_DAYS } from '../state/taskStore/recurrence.js';
import { toLocalDateKey, parseLocalDateKey, addDays, todayLocal } from '../state/date.js';
import CaseText from './CaseText.jsx';

const WEEKDAY_LABELS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const RECURRENCE_PRESETS = [
  { label: '1 week', days: 7 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 182 },
  { label: '1 year', days: MAX_RECURRENCE_DAYS },
];

function addDaysToKey(dateKey, n) {
  return toLocalDateKey(addDays(parseLocalDateKey(dateKey), n));
}

/** Today if it matches one of the selected weekdays, else the next date that does. */
function nextOccurrenceKey(weekdays) {
  const todayKey = todayLocal();
  if (!weekdays || weekdays.length === 0) return todayKey;

  const todayDow = parseLocalDateKey(todayKey).getDay();
  if (weekdays.includes(todayDow)) return todayKey;

  for (let offset = 1; offset <= 6; offset++) {
    if (weekdays.includes((todayDow + offset) % 7)) {
      return addDaysToKey(todayKey, offset);
    }
  }
  return todayKey;
}

export default function AddTaskPanel({ className = "", accessToken }) {
  const {
    getCategories,
    addTask,
    addCategory,
    tasks,
    editingTask,
    saveTaskEdits,
    cancelEditTask,
    moveTaskToDate,
    addRecurringTask,
    saveTaskSeriesEdits
  } = useTaskStore();

  const categories = getCategories();
  const [driveStatus, setDriveStatus] = useState('');

  const [text, setText] = useState('');
  const [title, setTitle] = useState(''); // NEW FIELD
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [date, setDate] = useState('');

  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatWeekdays, setRepeatWeekdays] = useState([]);
  const [repeatEndDate, setRepeatEndDate] = useState('');

  const [isGoalTask, setIsGoalTask] = useState(false);
  const [goalTargetInput, setGoalTargetInput] = useState('');

  const isCreatingNewCategory = category === '__new__';
  const isEditing = Boolean(editingTask);
  const editingSeriesId = editingTask?.task?.seriesId || null;

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
    setRepeatEnabled(false);
    setRepeatWeekdays([]);
    setRepeatEndDate('');
    setIsGoalTask(false);
    setGoalTargetInput('');
  }, [editingTask]);

  // Auto-fill the starting date: today, or the next occurrence of the
  // earliest selected weekday if today isn't one of them. Recomputes
  // whenever the day-of-week selection changes.
  useEffect(() => {
    if (repeatEnabled) {
      setDate(nextOccurrenceKey(repeatWeekdays));
    }
  }, [repeatEnabled, repeatWeekdays]);

  // Default the "repeat until" date to +1 month once repeat is enabled,
  // without clobbering a manual edit.
  useEffect(() => {
    if (repeatEnabled && date && !repeatEndDate) {
      setRepeatEndDate(clampEndDate(date, addDaysToKey(date, 30)));
    }
  }, [repeatEnabled, date, repeatEndDate]);

  function toggleWeekday(value) {
    setRepeatWeekdays((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

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

  async function handleSaveToDrive() {
    setDriveStatus('Saving…');
    try {
      await saveTasksToDrive(accessToken, tasks);
      setDriveStatus('Saved to Drive');
    } catch (err) {
      console.error(err);
      setDriveStatus('Failed to save: ' + err.message);
    }
  }

  function resetForm() {
    setText('');
    setTitle('');
    setCategory('');
    setNewCategory('');
    setDate('');
    setRepeatEnabled(false);
    setRepeatWeekdays([]);
    setRepeatEndDate('');
    setIsGoalTask(false);
    setGoalTargetInput('');
  }

  // -----------------------------
  // SUBMIT HANDLER (ADD vs EDIT vs RECURRING)
  // -----------------------------
  function handleSubmit(e, { series = false } = {}) {
    e?.preventDefault();
    if (!text.trim() || !date) return;
    if (!isEditing && repeatEnabled && repeatWeekdays.length === 0) return;
    if (!isEditing && repeatEnabled && repeatEndDate && repeatEndDate < date) return;
    if (!isEditing && isGoalTask && (!goalTargetInput || Number(goalTargetInput) <= 0)) return;

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

    if (!isEditing && isGoalTask) {
      taskData.goalTarget = Number(goalTargetInput);
      taskData.goalValue = 0;
    }

    if (isEditing) {
      if (editingSeriesId && series) {
        // Applies to every occurrence in the series; completion state is
        // never touched (saveTaskSeriesEdits strips it defensively too).
        saveTaskSeriesEdits(editingSeriesId, {
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
        });
        return;
      }

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
    } else if (repeatEnabled) {
      addRecurringTask(date, repeatEndDate || date, repeatWeekdays, taskData);
      resetForm();
    } else {
      // Create new task
      addTask(date, taskData);
      resetForm();
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
            <CaseText>{repeatEnabled ? 'Starting Date' : 'Date'}</CaseText>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="task-input"
          />
        </div>

        {/* Numeric goal */}
        {!isEditing && (
          <div className="goal-section">
            <label className="replace-toggle">
              <input
                type="checkbox"
                checked={isGoalTask}
                onChange={(e) => setIsGoalTask(e.target.checked)}
              />
              <CaseText>Track as a numeric goal</CaseText>
            </label>

            {isGoalTask && (
              <>
                <label style={{ display: 'block', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <CaseText>Goal target</CaseText>
                </label>
                <input
                  type="number"
                  min="1"
                  className="task-input"
                  placeholder="10000"
                  value={goalTargetInput}
                  onChange={(e) => setGoalTargetInput(e.target.value)}
                />

                {(!goalTargetInput || Number(goalTargetInput) <= 0) && (
                  <div className="form-error">
                    <CaseText>Enter a goal target greater than 0.</CaseText>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Repeat */}
        {!isEditing && (
          <div className="repeat-section">
            <label className="replace-toggle">
              <input
                type="checkbox"
                checked={repeatEnabled}
                onChange={(e) => setRepeatEnabled(e.target.checked)}
              />
              <CaseText>Repeat this task</CaseText>
            </label>

            {repeatEnabled && (
              <>
                <div className="weekday-picker">
                  {WEEKDAY_LABELS.map(({ value, label }) => (
                    <button
                      type="button"
                      key={value}
                      className={`weekday-toggle ${repeatWeekdays.includes(value) ? 'selected' : ''}`}
                      onClick={() => toggleWeekday(value)}
                    >
                      <CaseText>{label}</CaseText>
                    </button>
                  ))}
                </div>

                <label style={{ display: 'block', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <CaseText>Repeat until</CaseText>
                </label>
                <input
                  type="date"
                  className="task-input"
                  value={repeatEndDate}
                  min={date}
                  max={date ? clampEndDate(date, addDaysToKey(date, MAX_RECURRENCE_DAYS)) : undefined}
                  onChange={(e) => setRepeatEndDate(e.target.value)}
                />

                <div className="repeat-presets">
                  {RECURRENCE_PRESETS.map(({ label, days }) => (
                    <button
                      type="button"
                      key={label}
                      className="btn btn-small"
                      onClick={() => date && setRepeatEndDate(clampEndDate(date, addDaysToKey(date, days)))}
                    >
                      <CaseText>{label}</CaseText>
                    </button>
                  ))}
                </div>

                {repeatWeekdays.length === 0 && (
                  <div className="form-error">
                    <CaseText>Select at least one day.</CaseText>
                  </div>
                )}
                {repeatEndDate && repeatEndDate < date && (
                  <div className="form-error">
                    <CaseText>End date can't be before the start date.</CaseText>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {isEditing && editingSeriesId ? (
          <div className="series-edit-actions">
            <button
              type="button"
              className="btn"
              disabled={!text.trim() || !date}
              onClick={() => handleSubmit(null, { series: false })}
            >
              <CaseText>Save This Occurrence</CaseText>
            </button>
            <button
              type="button"
              className="btn"
              disabled={!text.trim()}
              onClick={() => handleSubmit(null, { series: true })}
            >
              <CaseText>Save Whole Series</CaseText>
            </button>
          </div>
        ) : (
          <button
            type="submit"
            className="btn"
            disabled={
              !text.trim() ||
              !date ||
              (!isEditing && repeatEnabled && repeatWeekdays.length === 0) ||
              (!isEditing && repeatEnabled && repeatEndDate && repeatEndDate < date) ||
              (!isEditing && isGoalTask && (!goalTargetInput || Number(goalTargetInput) <= 0))
            }
          >
            <CaseText>{isEditing ? 'Save Changes' : 'Add Task'}</CaseText>
          </button>
        )}

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

      <div className="task-panel-actions-row">
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="btn btn-small"
        >
          <CaseText>Download CSV</CaseText>
        </button>

        {accessToken && (
          <button
            type="button"
            onClick={handleSaveToDrive}
            className="btn btn-small"
          >
            <CaseText>Save Tasks to Drive</CaseText>
          </button>
        )}
      </div>

      {driveStatus && (
        <div className="task-panel-actions-status">{driveStatus}</div>
      )}
    </aside>
  );
}
