// parseCsv.js
// Minimal CSV parser and helpers to convert CSV text into task objects.
// Supports:
// 1) Wide format: date + category columns
// 2) Long format: date, category, text/description, title, completed
// 3) Legacy row-per-task format

// ------------------------------------------------------------
// BASIC CSV PARSER (unchanged)
// ------------------------------------------------------------
export function parseCsv(text) {
  const firstLine = (text || '').split(/\r?\n/)[0] || '';
  const delimiter =
    firstLine.indexOf('\t') >= 0 && firstLine.indexOf(',') === -1
      ? '\t'
      : ',';

  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
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

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur);
      cur = '';
      rows.push(row);
      row = [];
      continue;
    }

    cur += ch;
  }

  row.push(cur);
  rows.push(row);

  return rows.map((r) =>
    r.map((c) =>
      c === undefined || c === null ? '' : c.toString().trim()
    )
  );
}

// ------------------------------------------------------------
// Convert CSV rows → array of objects
// ------------------------------------------------------------
export function csvToObjects(text) {
  const rows = parseCsv(text).filter(
    (r) => r.length > 0 && !(r.length === 1 && r[0] === '')
  );
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) =>
    h === undefined || h === null ? '' : h.toString().trim().toLowerCase()
  );

  const out = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every((c) => c === '')) continue;

    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j] || `col${j}`;
      obj[key] = row[j] === undefined ? '' : row[j];
    }

    // Ensure completed is boolean
    if (obj.completed !== undefined) {
      const val = obj.completed.toString().toLowerCase();
      obj.completed = val === 'true' || val === '1';
    } else {
      obj.completed = false;
    }

    // Ensure title exists
    obj.title = obj.title || obj.description || '';

    out.push(obj);
  }

  return out;
}

// ------------------------------------------------------------
// Main CSV → tasks converter
// ------------------------------------------------------------
export function csvToTasks(text) {
  const rawRows = parseCsv(text).filter(
    (r) => r.length > 0 && !(r.length === 1 && r[0] === '')
  );
  if (rawRows.length === 0) return {};

  const headersRaw = rawRows[0].map((h) =>
    h === undefined || h === null ? '' : h.toString().trim()
  );
  const headersLower = headersRaw.map((h) => h.toLowerCase());
  const tasksByDate = {};

  // ------------------------------------------------------------
  // 1) LONG FORMAT DETECTION
  // ------------------------------------------------------------
  const isLongFormat =
    headersLower.includes('category') &&
    (headersLower.includes('text') || headersLower.includes('description')) &&
    headersLower.length >= 3;

  if (isLongFormat) {
    const objs = csvToObjects(text);

    objs.forEach((r) => {
      const dateVal = r.date;
      if (!dateVal) return;

      let dateKey = '';
      const d = new Date(dateVal);
      if (!isNaN(d)) dateKey = d.toISOString().slice(0, 10);
      else if (typeof dateVal === 'string' && dateVal.length >= 10)
        dateKey = dateVal.slice(0, 10);
      if (!dateKey) return;

      const category = r.category?.toString().trim();
      const description =
        r.text?.toString().trim() || r.description?.toString().trim();
      const title = r.title || description || '';
      const completed = r.completed || false;

      if (!category || !description) return;

      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push({
        category,
        description,
        title,
        completed,
      });
    });

    return tasksByDate;
  }

  // ------------------------------------------------------------
  // 2) WIDE FORMAT DETECTION
  // ------------------------------------------------------------
  const isWideFormat =
    headersLower[0] === 'date' &&
    headersLower.length > 1 &&
    !headersLower.includes('title') &&
    !headersLower.includes('task') &&
    !headersLower.includes('category') &&
    !headersLower.includes('text') &&
    !headersLower.includes('description');

  if (isWideFormat) {
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      const dateVal = (row[0] || '').toString().trim();
      if (!dateVal) continue;

      let dateKey = '';
      const d = new Date(dateVal);
      if (!isNaN(d)) dateKey = d.toISOString().slice(0, 10);
      else if (typeof dateVal === 'string' && dateVal.length >= 10)
        dateKey = dateVal.slice(0, 10);
      if (!dateKey) continue;

      for (let j = 1; j < headersRaw.length; j++) {
        const category = headersRaw[j] || `col${j}`;
        const cell =
          row[j] === undefined ? '' : row[j].toString().trim();
        if (!cell) continue;

        const parts = cell
          .split(/[;,]/)
          .map((s) => s.toString().trim())
          .filter(Boolean);

        parts.forEach((part) => {
          if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
          tasksByDate[dateKey].push({
            category,
            description: part,
            title: part,
            completed: false,
          });
        });
      }
    }

    return tasksByDate;
  }

  // ------------------------------------------------------------
  // 3) LEGACY ROW-PER-TASK FORMAT
  // ------------------------------------------------------------
  const objs = csvToObjects(text);

  objs.forEach((r) => {
    const dateVal = r.date;
    if (!dateVal) return;

    let dateKey = '';
    const d = new Date(dateVal);
    if (!isNaN(d)) dateKey = d.toISOString().slice(0, 10);
    else if (typeof dateVal === 'string' && dateVal.length >= 10)
      dateKey = dateVal.slice(0, 10);
    if (!dateKey) return;

    const category = r.category?.toString().trim() || 'Imported';
    const description =
      r.description?.toString().trim() ||
      r.text?.toString().trim() ||
      r.task?.toString().trim() ||
      '';
    const title = r.title || description;
    const completed = r.completed || false;

    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push({
      category,
      description,
      title,
      completed,
    });
  });

  return tasksByDate;
}

export default parseCsv;
