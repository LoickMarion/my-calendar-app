# CSV import test fixtures

Sample files for manually exercising the "Import CSV" button (`ImportControls.jsx` →
`csvToTasks` in `src/data/parseCsv.js`). Dates are set around the current date so
imported tasks show up on today's month view without navigating.

| File | Format | What it tests |
|---|---|---|
| `long-format.csv` | `date,category,text,title,completed` | The standard long format — one row per task. |
| `wide-format.csv` | `date,<Category1>,<Category2>,...` | One column per category; cells with `;`-separated values become multiple tasks. |
| `legacy-format.csv` | `date,description,title,completed` (no `category` column) | The legacy row-per-task fallback — tasks get category `"Imported"`. |
| `quoted-fields.csv` | long format | Commas and escaped `""` quotes inside quoted CSV fields. |
| `tab-delimited.csv` | long format, tab-separated | Parser's delimiter auto-detection (tabs vs. commas). |
| `invalid-dates.csv` | long format | Rows with an unparseable or empty date should be silently skipped. |
| `empty.csv` | — | Empty file should import zero tasks, not throw. |

To use: open the app, click **Import CSV**, and pick one of these files. Toggle
"Replace Existing Tasks" to test both merge and replace behavior.
