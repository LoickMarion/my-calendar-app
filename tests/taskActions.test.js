import { describe, it, expect, vi } from 'vitest';
import {
  addTask,
  deleteTask,
  moveTask,
  moveTaskToDate,
  reorderTask,
  startEditTask,
  cancelEditTask,
  saveTaskEdits,
} from '../src/state/taskStore/taskActions.js';

describe('addTask', () => {
  it('appends a new task to the given date with defaults filled in', () => {
    const tasks = { '2026-01-05': [] };
    const setTasks = vi.fn();
    addTask(tasks, setTasks, null, '2026-01-05', { category: 'Work', description: 'Finish report' });

    expect(setTasks).toHaveBeenCalledWith({
      '2026-01-05': [{ category: 'Work', description: 'Finish report', title: '', completed: false }],
    });
  });

  it('defaults the category to "Uncategorized" when none is given', () => {
    const setTasks = vi.fn();
    addTask({}, setTasks, null, '2026-01-05', { description: 'Something' });
    expect(setTasks.mock.calls[0][0]['2026-01-05'][0].category).toBe('Uncategorized');
  });

  it('calls initializeCategories with the updated tasks', () => {
    const initializeCategories = vi.fn();
    const setTasks = vi.fn();
    addTask({}, setTasks, initializeCategories, '2026-01-05', { category: 'Work' });
    expect(initializeCategories).toHaveBeenCalledWith(setTasks.mock.calls[0][0]);
  });
});

describe('deleteTask', () => {
  it('removes the task matching the given id', () => {
    const tasks = { '2026-01-05': [{ category: 'Work', title: 'A' }, { category: 'Work', title: 'B' }] };
    const setTasks = vi.fn();
    deleteTask(tasks, setTasks, '2026-01-05', 'task__2026-01-05__Work__0');
    expect(setTasks).toHaveBeenCalledWith({ '2026-01-05': [{ category: 'Work', title: 'B' }] });
  });

  it('does nothing when the task index does not exist', () => {
    const tasks = { '2026-01-05': [{ category: 'Work', title: 'A' }] };
    const setTasks = vi.fn();
    deleteTask(tasks, setTasks, '2026-01-05', 'task__2026-01-05__Work__9');
    expect(setTasks).not.toHaveBeenCalled();
  });
});

describe('moveTask', () => {
  it('reorders tasks within the same category', () => {
    const tasks = {
      '2026-01-05': [
        { category: 'Work', title: 'A' },
        { category: 'Work', title: 'B' },
        { category: 'Work', title: 'C' },
      ],
    };
    const setTasks = vi.fn();
    moveTask(tasks, setTasks, '2026-01-05', 'task__Work__0', 'task__Work__2');
    expect(setTasks.mock.calls[0][0]['2026-01-05'].map(t => t.title)).toEqual(['B', 'C', 'A']);
  });

  it('is a no-op across different categories', () => {
    const tasks = { '2026-01-05': [{ category: 'Work' }, { category: 'Home' }] };
    const setTasks = vi.fn();
    moveTask(tasks, setTasks, '2026-01-05', 'task__Work__0', 'task__Home__0');
    expect(setTasks).not.toHaveBeenCalled();
  });
});

describe('moveTaskToDate', () => {
  it('moves a task from one date to another', () => {
    const tasks = {
      '2026-01-05': [{ category: 'Work', title: 'Report' }],
      '2026-01-06': [],
    };
    const setTasks = vi.fn();
    moveTaskToDate(tasks, setTasks, '2026-01-05', '2026-01-06', 'task__Work__0');
    expect(setTasks).toHaveBeenCalledWith({
      '2026-01-05': [],
      '2026-01-06': [{ category: 'Work', title: 'Report' }],
    });
  });
});

describe('startEditTask', () => {
  it('sets the editing task when the task exists', () => {
    const tasks = { '2026-01-05': [{ category: 'Work', title: 'Report' }] };
    const setEditingTask = vi.fn();
    startEditTask(tasks, setEditingTask, '2026-01-05', 'task__2026-01-05__Work__0');
    expect(setEditingTask).toHaveBeenCalledWith({
      dateKey: '2026-01-05',
      taskId: 'task__2026-01-05__Work__0',
      task: { category: 'Work', title: 'Report' },
    });
  });

  it('does nothing when the task cannot be found', () => {
    const tasks = { '2026-01-05': [{ category: 'Work', title: 'Report' }] };
    const setEditingTask = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    startEditTask(tasks, setEditingTask, '2026-01-05', 'task__2026-01-05__Work__9');
    expect(setEditingTask).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('cancelEditTask', () => {
  it('clears the editing task', () => {
    const setEditingTask = vi.fn();
    cancelEditTask(setEditingTask);
    expect(setEditingTask).toHaveBeenCalledWith(null);
  });
});

describe('saveTaskEdits', () => {
  it('applies updates to a task that stays on the same date', () => {
    const tasks = { '2026-01-05': [{ category: 'Work', title: 'Draft report' }] };
    const setTasks = vi.fn();
    const setEditingTask = vi.fn();

    saveTaskEdits(tasks, setTasks, setEditingTask, '2026-01-05', 'task__2026-01-05__Work__0', {
      title: 'Final report',
    });

    expect(setTasks).toHaveBeenCalledWith({
      '2026-01-05': [{ category: 'Work', title: 'Final report' }],
    });
    expect(setEditingTask).toHaveBeenCalledWith(null);
  });

  it('moves the task to a new date when dateKey differs from the id', () => {
    const tasks = {
      '2026-01-05': [{ category: 'Work', title: 'Report' }],
      '2026-01-06': [],
    };
    const setTasks = vi.fn();
    const setEditingTask = vi.fn();

    saveTaskEdits(tasks, setTasks, setEditingTask, '2026-01-06', 'task__2026-01-05__Work__0', {
      title: 'Report v2',
    });

    expect(setTasks).toHaveBeenCalledWith({
      '2026-01-05': [],
      '2026-01-06': [{ category: 'Work', title: 'Report v2' }],
    });
  });

  it('does nothing when the task cannot be found', () => {
    const tasks = { '2026-01-05': [{ category: 'Work', title: 'Report' }] };
    const setTasks = vi.fn();
    const setEditingTask = vi.fn();

    saveTaskEdits(tasks, setTasks, setEditingTask, '2026-01-05', 'task__2026-01-05__Work__9', {
      title: 'Nope',
    });

    expect(setTasks).not.toHaveBeenCalled();
    expect(setEditingTask).not.toHaveBeenCalled();
  });
});

describe('reorderTask', () => {
  it('moves a task into a different category at the target index', () => {
    const tasks = {
      '2026-01-05': [
        { category: 'Work', title: 'A' },
        { category: 'Home', title: 'B' },
      ],
    };
    const setTasks = vi.fn();
    reorderTask(tasks, setTasks, '2026-01-05', 'task__Work__0', 'task__Home__0');
    const result = setTasks.mock.calls[0][0]['2026-01-05'];
    expect(result.map(t => t.title)).toEqual(['A', 'B']);
    expect(result[0].category).toBe('Work');
  });
});
