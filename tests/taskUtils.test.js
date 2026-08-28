import { describe, it, expect } from 'vitest';
import {
  normalizeTaskId,
  toggleTaskComplete,
  addDeterministicIds,
  getCategoryKeyForTask,
  initializeCategories,
  getTasksForDate,
  getFilteredTasks,
} from '../src/state/taskStore/taskUtils.js';

describe('normalizeTaskId', () => {
  it('strips a leading "task__" prefix', () => {
    expect(normalizeTaskId('task__2026-01-05__Work__0')).toBe('2026-01-05__Work__0');
  });

  it('leaves ids without the prefix untouched', () => {
    expect(normalizeTaskId('2026-01-05__Work__0')).toBe('2026-01-05__Work__0');
  });
});

describe('getCategoryKeyForTask', () => {
  it('returns the trimmed category when present', () => {
    expect(getCategoryKeyForTask({ category: '  Work  ' })).toBe('Work');
  });

  it('falls back to "Uncategorized" when missing or blank', () => {
    expect(getCategoryKeyForTask({})).toBe('Uncategorized');
    expect(getCategoryKeyForTask({ category: '' })).toBe('Uncategorized');
  });
});

describe('addDeterministicIds', () => {
  it('assigns ids in the form dateKey__category__index', () => {
    const out = addDeterministicIds({
      '2026-01-05': [{ category: 'Work' }, { category: 'Work' }],
    });
    expect(out['2026-01-05'].map(t => t.id)).toEqual([
      '2026-01-05__Work__0',
      '2026-01-05__Work__1',
    ]);
  });

  it('does not mutate the original tasks object', () => {
    const input = { '2026-01-05': [{ category: 'Work' }] };
    addDeterministicIds(input);
    expect(input['2026-01-05'][0].id).toBeUndefined();
  });
});

describe('toggleTaskComplete', () => {
  function makeState(tasks) {
    let state = tasks;
    const setTasks = (updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
    };
    return { setTasks, getState: () => state };
  }

  it('flips completed on the targeted task', () => {
    const { setTasks, getState } = makeState({
      '2026-01-05': [{ category: 'Work', completed: false }],
    });
    toggleTaskComplete(setTasks, '2026-01-05', 'task__2026-01-05__Work__0');
    expect(getState()['2026-01-05'][0].completed).toBe(true);
  });

  it('leaves state unchanged when the task cannot be found', () => {
    const original = { '2026-01-05': [{ category: 'Work', completed: false }] };
    const { setTasks, getState } = makeState(original);
    toggleTaskComplete(setTasks, '2026-01-05', 'task__2026-01-05__Work__5');
    expect(getState()).toBe(original);
  });
});

describe('initializeCategories', () => {
  it('collects unique categories and enables them by default', () => {
    const { enabledCategories } = initializeCategories({
      '2026-01-05': [{ category: 'Work' }, { category: 'Home' }, { category: 'Work' }],
    });
    expect(enabledCategories).toEqual({ Work: true, Home: true });
  });

  it('preserves previously enabled/disabled state for existing categories', () => {
    const { enabledCategories } = initializeCategories(
      { '2026-01-05': [{ category: 'Work' }] },
      { Work: false }
    );
    expect(enabledCategories.Work).toBe(false);
  });

  it('falls back to the previous state when there are no tasks', () => {
    const prevEnabled = { Work: true };
    const prevColors = { Work: 'hsl(1 1% 1%)' };
    const result = initializeCategories({}, prevEnabled, prevColors);
    expect(result.enabledCategories).toBe(prevEnabled);
    expect(result.categoryColors).toBe(prevColors);
  });
});

describe('getTasksForDate', () => {
  const tasks = {
    '2026-01-05': [
      { category: 'Work', title: 'Report' },
      { category: 'Home', title: 'Laundry' },
    ],
  };

  it('accepts a Date object', () => {
    const result = getTasksForDate(tasks, { Work: true, Home: true }, new Date(2026, 0, 5));
    expect(result).toHaveLength(2);
  });

  it('accepts a YYYY-MM-DD string', () => {
    const result = getTasksForDate(tasks, { Work: true, Home: true }, '2026-01-05');
    expect(result.map(t => t.title)).toEqual(['Report', 'Laundry']);
  });

  it('filters out disabled categories', () => {
    const result = getTasksForDate(tasks, { Work: true, Home: false }, '2026-01-05');
    expect(result.map(t => t.title)).toEqual(['Report']);
  });

  it('returns an empty array for a falsy date', () => {
    expect(getTasksForDate(tasks, {}, null)).toEqual([]);
  });

  it('returns an empty array for an unrecognized date type', () => {
    expect(getTasksForDate(tasks, {}, 12345)).toEqual([]);
  });
});

describe('getFilteredTasks', () => {
  it('removes disabled categories and drops days left with no tasks', () => {
    const tasks = {
      '2026-01-05': [{ category: 'Work' }],
      '2026-01-06': [{ category: 'Home' }],
    };
    const result = getFilteredTasks(tasks, { Work: true, Home: false });
    expect(result).toEqual({ '2026-01-05': [{ category: 'Work' }] });
  });
});
