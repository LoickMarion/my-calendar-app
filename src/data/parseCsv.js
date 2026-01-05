// parseCsv.js
// Minimal CSV parser and helpers to convert CSV text into task objects.
// - Supports quoted fields and escaped quotes ("")
// - Expects a header row with column names (case-insensitive)
// - Exported helpers: parseCsv, csvToObjects, csvToTasks

export function parseCsv(text) {
  // Detect delimiter by inspecting the header line: prefer tab if tabs are present and commas are not.
  const firstLine = (text || '').split(/\r?\n/)[0] || '';
  const delimiter = (firstLine.indexOf('\t') >= 0 && firstLine.indexOf(',') === -1) ? '\t' : ',';

  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        // Escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === delimiter && !inQuotes) {
      row.push(cur);
      cur = '';
      continue;
    }

    // handle newlines when not in quotes
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // handle CRLF
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur);
      cur = '';
      rows.push(row);
      row = [];
      continue;
    }

    cur += ch;
  }

  // push remaining
  row.push(cur);
  rows.push(row);

  // Trim whitespace from cells
  return rows.map((r) => r.map((c) => (c === undefined || c === null ? '' : c.toString().trim())));
}

export function csvToObjects(text) {
  const rows = parseCsv(text).filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ''));
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.toString().trim().toLowerCase());
  const out = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // skip empty rows
    if (row.every((c) => c === '')) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j] || `col${j}`;
      obj[key] = row[j] === undefined ? '' : row[j];
    }
    out.push(obj);
  }

  return out;
}

export function csvToTasks(text) {
  // Converts CSV/TSV text into the tasks-by-date object used by the app.
  // Two supported formats:
  // 1) Row-per-task: header includes `date` and (title|task) columns.
  // 2) Wide format: header starts with `date` and the remaining headers are treated as task titles; cell values are bodies, and semicolons create multiple tasks.

  const rawRows = parseCsv(text).filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ''));
  if (rawRows.length === 0) return {};

  const headersRaw = rawRows[0].map((h) => (h === undefined || h === null ? '' : h.toString().trim()));
  const headersLower = headersRaw.map((h) => h.toLowerCase());
  const tasksByDate = {};

  const isWideFormat = headersLower[0] === 'date' && headersLower.length > 1 && !headersLower.includes('title') && !headersLower.includes('task');

  if (isWideFormat) {
    // Wide format: each column after date is a task title; cell values are bodies (split on ; or , to create multiple tasks)
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      const dateVal = (row[0] || '').toString().trim();
      if (!dateVal) continue;

      // normalize date
      let dateKey = '';
      const d = new Date(dateVal);
      if (!isNaN(d)) dateKey = d.toISOString().slice(0, 10);
      else if (typeof dateVal === 'string' && dateVal.length >= 10) dateKey = dateVal.slice(0, 10);
      if (!dateKey) continue;

      for (let j = 1; j < headersRaw.length; j++) {
        const title = headersRaw[j] || `col${j}`;
        const cell = row[j] === undefined ? '' : row[j].toString().trim();
        if (!cell) continue;

        const parts = cell.split(/[;,]/).map((s) => s.toString().trim()).filter(Boolean);
        parts.forEach((part) => {
          if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
          // Use header as both title and category so the categories list contains the column headers
          tasksByDate[dateKey].push({ title, description: part, category: title });
        });
      }
    }

    return tasksByDate;
  }

  // Fallback: row-per-task format (header contains date + title/task)
  const objs = csvToObjects(text);
  objs.forEach((r) => {
    const dateVal = r.date || r.dat || r.day || r['date'];
    if (!dateVal) return;

    // normalize date: try constructing a Date
    let dateKey = '';
    const d = new Date(dateVal);
    if (!isNaN(d)) dateKey = d.toISOString().slice(0, 10);
    else if (typeof dateVal === 'string' && dateVal.length >= 10) dateKey = dateVal.slice(0, 10);

    if (!dateKey) return;

    const task = {};
    // Common fields
    task.title = r.title || r.task || r.event || '(no title)';
    task.category = r.category || r.cat || 'Imported';
    if (r.description) task.description = r.description;

    // tags: split by ; or ,
    if (r.tags) {
      task.tags = r.tags.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
    }

    // include any other columns dynamically
    Object.keys(r).forEach((k) => {
      if (!['date', 'title', 'task', 'event', 'category', 'cat', 'description', 'tags'].includes(k)) {
        task[k] = r[k];
      }
    });

    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push(task);
  });

  return tasksByDate;
}

export default parseCsv;