// loadFromGoogleSheet.js
// Lightweight loader for a public Google Sheet using the `gviz` JSON endpoint.
// Usage:
// - Make your sheet public or "Publish to the web" (for read-only access)
// - Set VITE_SHEET_ID in your `.env` (the spreadsheet ID from the URL)
// - Optionally set VITE_SHEET_NAME to choose a specific sheet/tab
// The sheet should have columns like: `date`, `title`, `category` (case-insensitive)

export async function loadFromGoogleSheet(sheetId, sheetName) {
  const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${sheetParam}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status} ${res.statusText}`);

  const text = await res.text();

  // The response is not pure JSON; it looks like: google.visualization.Query.setResponse({...});
  // Extract the first {...} block and parse it.
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid sheet response format');

  const data = JSON.parse(jsonMatch[0]);

  // data.table.cols -> column metadata (labels)
  // data.table.rows -> rows with .c array of cell objects {v: value}
  const cols = (data.table.cols || []).map((c) => (c.label || c.id || '').toString().toLowerCase());
  const rows = data.table.rows || [];

  const tasksByDate = {};

  rows.forEach((r) => {
    const cells = r.c || [];
    const rowObj = {};
    cells.forEach((cell, i) => {
      const key = cols[i] || `col${i}`;
      rowObj[key] = cell ? cell.v : '';
    });

    // Accept either a proper date, or a string like "2025-01-01" in the `date` column.
    let dateKey = '';
    if (rowObj.date) {
      const d = new Date(rowObj.date);
      if (!isNaN(d)) dateKey = d.toISOString().slice(0, 10);
      else if (typeof rowObj.date === 'string') dateKey = rowObj.date.slice(0, 10);
    }

    if (!dateKey) return; // skip rows without a parsable date

    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push({
      title: rowObj.title || '(no title)',
      category: rowObj.category || 'General',
    });
  });

  return tasksByDate;
}

export default loadFromGoogleSheet;