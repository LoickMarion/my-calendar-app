import { describe, it, expect } from 'vitest';
import { toLocalDateKey, todayLocal, addDays, parseLocalDateKey } from '../src/state/date.js';

describe('toLocalDateKey', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toLocalDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('pads single-digit months and days', () => {
    expect(toLocalDateKey(new Date(2026, 8, 1))).toBe('2026-09-01');
  });

  it('handles December correctly', () => {
    expect(toLocalDateKey(new Date(2025, 11, 31))).toBe('2025-12-31');
  });
});

describe('parseLocalDateKey', () => {
  it('parses a YYYY-MM-DD string into a local Date', () => {
    const d = parseLocalDateKey('2026-03-15');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it('round-trips with toLocalDateKey', () => {
    const key = '2026-07-04';
    expect(toLocalDateKey(parseLocalDateKey(key))).toBe(key);
  });
});

describe('addDays', () => {
  it('adds positive days, rolling over month boundaries', () => {
    const d = addDays(new Date(2026, 0, 30), 3);
    expect(toLocalDateKey(d)).toBe('2026-02-02');
  });

  it('subtracts days with a negative n', () => {
    const d = addDays(new Date(2026, 2, 1), -1);
    expect(toLocalDateKey(d)).toBe('2026-02-28');
  });

  it('does not mutate the input date', () => {
    const original = new Date(2026, 0, 1);
    const originalKey = toLocalDateKey(original);
    addDays(original, 5);
    expect(toLocalDateKey(original)).toBe(originalKey);
  });
});

describe('todayLocal', () => {
  it('matches toLocalDateKey(new Date())', () => {
    expect(todayLocal()).toBe(toLocalDateKey(new Date()));
  });
});
