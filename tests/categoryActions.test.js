import { describe, it, expect, vi } from 'vitest';
import {
  addCategory,
  deleteCategory,
  renameCategory,
  getCategories,
  getCategoryCounts,
  getCategoryColor,
  isCategoryEnabled,
  setCategoryEnabled,
  toggleAllCategories,
} from '../src/state/taskStore/categoryActions.js';

function captureUpdater(prev) {
  let state = prev;
  const setter = (updater) => {
    state = typeof updater === 'function' ? updater(state) : updater;
  };
  return { setter, getState: () => state };
}

describe('addCategory', () => {
  it('enables the category and assigns it a default color', () => {
    const cats = captureUpdater({});
    const colors = captureUpdater({});
    addCategory(cats.setter, colors.setter, 'Work');
    expect(cats.getState()).toEqual({ Work: true });
    expect(colors.getState()).toEqual({ Work: 'hsl(220 60% 60%)' });
  });
});

describe('deleteCategory', () => {
  it('removes tasks, enabled state, and color for the category', () => {
    const tasksState = captureUpdater({
      '2026-01-05': [{ category: 'Work' }, { category: 'Home' }],
    });
    const enabledState = captureUpdater({ Work: true, Home: true });
    const colorsState = captureUpdater({ Work: 'red', Home: 'blue' });

    deleteCategory(tasksState.setter, enabledState.setter, colorsState.setter, 'Work');

    expect(tasksState.getState()).toEqual({ '2026-01-05': [{ category: 'Home' }] });
    expect(enabledState.getState()).toEqual({ Home: true });
    expect(colorsState.getState()).toEqual({ Home: 'blue' });
  });

  it('drops a date entirely once its last task is removed', () => {
    const tasksState = captureUpdater({ '2026-01-05': [{ category: 'Work' }] });
    deleteCategory(tasksState.setter, () => {}, () => {}, 'Work');
    expect(tasksState.getState()).toEqual({});
  });
});

describe('renameCategory', () => {
  it('updates tasks, enabled state, and colors to the new name', () => {
    const tasksState = captureUpdater({ '2026-01-05': [{ category: 'Work' }] });
    const enabledState = captureUpdater({ Work: true });
    const colorsState = captureUpdater({ Work: 'red' });

    renameCategory(
      {}, tasksState.setter,
      {}, enabledState.setter,
      {}, colorsState.setter,
      'Work', 'Job'
    );

    expect(tasksState.getState()['2026-01-05'][0].category).toBe('Job');
    expect(enabledState.getState()).toEqual({ Job: true });
    expect(colorsState.getState()).toEqual({ Job: 'red' });
  });

  it('is a no-op when old and new names match, or either is missing', () => {
    const setTasks = vi.fn();
    renameCategory({}, setTasks, {}, vi.fn(), {}, vi.fn(), 'Work', 'Work');
    renameCategory({}, setTasks, {}, vi.fn(), {}, vi.fn(), '', 'Job');
    expect(setTasks).not.toHaveBeenCalled();
  });
});

describe('getCategories', () => {
  it('returns category names sorted alphabetically', () => {
    expect(getCategories({ Work: true, Home: true, Art: true })).toEqual(['Art', 'Home', 'Work']);
  });
});

describe('getCategoryCounts', () => {
  it('counts tasks per category across all dates', () => {
    const tasks = {
      '2026-01-05': [{ category: 'Work' }, { category: 'Home' }],
      '2026-01-06': [{ category: 'Work' }],
    };
    const counts = getCategoryCounts(tasks, (t) => t.category);
    expect(counts).toEqual({ Work: 2, Home: 1 });
  });
});

describe('getCategoryColor / isCategoryEnabled', () => {
  it('falls back to a default color when unset', () => {
    expect(getCategoryColor({}, 'Work')).toBe('hsl(220 60% 60%)');
  });

  it('returns a stored color when present', () => {
    expect(getCategoryColor({ Work: 'red' }, 'Work')).toBe('red');
  });

  it('reports enabled state as a boolean', () => {
    expect(isCategoryEnabled({ Work: true }, 'Work')).toBe(true);
    expect(isCategoryEnabled({}, 'Work')).toBe(false);
  });
});

describe('setCategoryEnabled / toggleAllCategories', () => {
  it('sets a single category enabled flag', () => {
    const state = captureUpdater({ Work: false });
    setCategoryEnabled(state.setter, 'Work', true);
    expect(state.getState()).toEqual({ Work: true });
  });

  it('sets all categories to the same enabled flag', () => {
    const state = captureUpdater({ Work: true, Home: false });
    toggleAllCategories(state.setter, { Work: true, Home: false }, false);
    expect(state.getState()).toEqual({ Work: false, Home: false });
  });
});
