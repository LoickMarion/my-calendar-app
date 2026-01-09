// loadFromGoogleSheet.js
// Lightweight loader for a public Google Sheet using the `gviz` JSON endpoint.

import { toLocalDateKey, parseLocalDateKey } from '../state/date.js';

export async function loadFromGoogleSheet(sheetId, sheetName) {
  const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${sheetParam}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status} ${res.statusText}`);

  const text = await res.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid sheet response format');

  const data = JSON.parse(jsonMatch[0]);

  const cols = (data.table.cols || []).map((c) =>
    (c.label || c.id || '').toString().toLowerCase()
  );
  const rows = data.table.rows || [];

  const tasksByDate = {};

  rows.forEach((r) => {
    const cells = r.c || [];
    const rowObj = {};

    cells.forEach((cell, i) => {
      const key = cols[i] || `col${i}`;
      rowObj[key] = cell ? cell.v : '';
    });

    // 🔥 FIXED: local‑safe date parsing
    let dateKey = '';

    if (rowObj.date) {
      if (typeof rowObj.date === 'string') {
        // If it's already a YYYY-MM-DD string, use it directly
        const trimmed = rowObj.date.trim().slice(0, 10);
        const parsed = parseLocalDateKey(trimmed);
        if (!isNaN(parsed)) dateKey = toLocalDateKey(parsed);
      } else {
        // If Google gives a real Date object or serial number
        const d = new Date(rowObj.date);
        if (!isNaN(d)) dateKey = toLocalDateKey(d);
      }
    }

    if (!dateKey) return;

    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push({
      title: rowObj.title || '(no title)',
      category: rowObj.category || 'General',
    });
  });

  return tasksByDate;
}

export default loadFromGoogleSheet;
