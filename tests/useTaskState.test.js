// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

vi.mock('../src/data/loadTasks', () => ({
  loadTasks: vi.fn(),
}));

import { loadTasks } from '../src/data/loadTasks';
import { useTaskState } from '../src/state/taskStore/useTaskState.js';

beforeEach(() => {
  localStorage.clear();
  loadTasks.mockReset();
});

describe('useTaskState', () => {
  it('loads synchronous task data and assigns deterministic ids', async () => {
    loadTasks.mockReturnValue({
      '2026-01-05': [{ category: 'Work', title: 'Report' }],
    });

    const { result } = renderHook(() => useTaskState());

    await waitFor(() => {
      expect(result.current.tasks['2026-01-05']).toBeDefined();
    });

    expect(result.current.tasks['2026-01-05'][0].id).toBe('2026-01-05__Work__0');
  });

  it('loads asynchronous (promise-based) task data', async () => {
    loadTasks.mockReturnValue(
      Promise.resolve({ '2026-01-06': [{ category: 'Home', title: 'Laundry' }] })
    );

    const { result } = renderHook(() => useTaskState());

    await waitFor(() => {
      expect(result.current.tasks['2026-01-06']).toBeDefined();
    });

    expect(result.current.tasks['2026-01-06'][0].id).toBe('2026-01-06__Home__0');
  });

  it('derives enabled categories from loaded tasks', async () => {
    loadTasks.mockReturnValue({
      '2026-01-05': [{ category: 'Work' }, { category: 'Home' }],
    });

    const { result } = renderHook(() => useTaskState());

    await waitFor(() => {
      expect(result.current.enabledCategories).toEqual({ Work: true, Home: true });
    });
  });

  it('toggles showIncompleteOnly', async () => {
    loadTasks.mockReturnValue({});
    const { result } = renderHook(() => useTaskState());

    expect(result.current.showIncompleteOnly).toBe(false);

    act(() => {
      result.current.toggleShowIncompleteOnly();
    });

    expect(result.current.showIncompleteOnly).toBe(true);
  });

  it('persists category colors to localStorage when they change', async () => {
    loadTasks.mockReturnValue({});
    const { result } = renderHook(() => useTaskState());

    act(() => {
      result.current.setCategoryColors({ Work: 'hsl(1 1% 1%)' });
    });

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('calendar_category_colors'))).toEqual({
        Work: 'hsl(1 1% 1%)',
      });
    });
  });

  it('loads persisted category colors from localStorage on mount', async () => {
    localStorage.setItem('calendar_category_colors', JSON.stringify({ Home: 'blue' }));
    loadTasks.mockReturnValue({});

    const { result } = renderHook(() => useTaskState());

    await waitFor(() => {
      expect(result.current.categoryColors).toEqual({ Home: 'blue' });
    });
  });

  describe('importTasks', () => {
    it('merges new tasks into existing ones by default', async () => {
      loadTasks.mockReturnValue({ '2026-01-05': [{ category: 'Work', id: 'a' }] });
      const { result } = renderHook(() => useTaskState());

      await waitFor(() => expect(result.current.tasks['2026-01-05']).toBeDefined());

      act(() => {
        result.current.importTasks({ '2026-01-05': [{ category: 'Home', id: 'b' }] });
      });

      expect(result.current.tasks['2026-01-05']).toHaveLength(2);
    });

    it('replaces all tasks when options.replace is true', async () => {
      loadTasks.mockReturnValue({ '2026-01-05': [{ category: 'Work' }] });
      const { result } = renderHook(() => useTaskState());

      await waitFor(() => expect(result.current.tasks['2026-01-05']).toBeDefined());

      act(() => {
        result.current.importTasks(
          { '2026-02-01': [{ category: 'Home' }] },
          { replace: true }
        );
      });

      expect(result.current.tasks).toEqual({ '2026-02-01': [{ category: 'Home' }] });
    });
  });
});
