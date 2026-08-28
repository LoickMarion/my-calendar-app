// recurrence.js
// Pure date-generation helpers for repeating tasks. No React/state here.

import { toLocalDateKey, parseLocalDateKey, addDays } from '../date.js';

export const MAX_RECURRENCE_DAYS = 365;

/** Clamp so the span from start never exceeds MAX_RECURRENCE_DAYS, regardless of input. */
export function clampEndDate(startDateKey, endDateKey) {
  const start = parseLocalDateKey(startDateKey);
  const cap = addDays(start, MAX_RECURRENCE_DAYS);
  const requested = parseLocalDateKey(endDateKey);
  return requested > cap ? toLocalDateKey(cap) : endDateKey;
}

/**
 * Sorted dateKeys between start/end (inclusive) whose weekday is in `weekdays`
 * (0=Sun..6=Sat). Always clamps internally — never trusts the caller's end date.
 * Returns [] if weekdays is empty or end < start.
 */
export function generateOccurrenceDateKeys(startDateKey, endDateKey, weekdays) {
  if (!startDateKey || !weekdays || weekdays.length === 0) return [];

  const safeEnd = clampEndDate(startDateKey, endDateKey || startDateKey);
  const start = parseLocalDateKey(startDateKey);
  const end = parseLocalDateKey(safeEnd);
  if (end < start) return [];

  const weekdaySet = new Set(weekdays);
  const out = [];
  let cursor = start;
  while (cursor <= end) {
    if (weekdaySet.has(cursor.getDay())) out.push(toLocalDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return out;
}
