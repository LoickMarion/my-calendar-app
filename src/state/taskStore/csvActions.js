// csvActions.js

/*Escape a single CSV value */
export function escapeCSV(value) {
  if (value == null) return "";
  const str = value.toString();
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**Convert tasks object to CSV string */
export function tasksToCSV(tasks) {
  const rows = [["date", "category", "text"]];

  for (const dateKey of Object.keys(tasks)) {
    const arr = tasks[dateKey] || [];
    arr.forEach(t => {
      rows.push([
        dateKey,
        t.category || "",
        t.description || ""
      ]);
    });
  }

  return rows.map(r => r.map(escapeCSV).join(",")).join("\n");
}
