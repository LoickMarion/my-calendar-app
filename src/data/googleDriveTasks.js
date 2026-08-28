// googleDriveTasks.js
// Plain-fetch helpers for reading/writing a single tasks JSON file in the
// user's Google Drive, using the drive.file scope already granted at login.
// Mirrors googleDriveTheme.js.

const TASKS_FILENAME = 'pookie-calendar-tasks.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function assertOk(res, action) {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${action} failed: ${res.status} ${res.statusText} ${body}`);
  }
}

/** Find the tasks file by name. Returns { id } or null. */
export async function findTasksFile(accessToken) {
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(
    `name='${TASKS_FILENAME}' and trashed=false`
  )}&fields=${encodeURIComponent('files(id)')}`;

  const res = await fetch(url, { headers: authHeaders(accessToken) });
  await assertOk(res, 'findTasksFile');

  const data = await res.json();
  const file = (data.files || [])[0];
  return file ? { id: file.id } : null;
}

/** Create the tasks file with the given content. Returns the new file id. */
export async function createTasksFile(accessToken, tasks) {
  const metadata = { name: TASKS_FILENAME };
  const body = new FormData();
  body.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  body.append('file', new Blob([JSON.stringify(tasks)], { type: 'application/json' }));

  const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body,
  });
  await assertOk(res, 'createTasksFile');

  const data = await res.json();
  return data.id;
}

/** Overwrite the tasks file's content. */
export async function writeTasksFile(accessToken, fileId, tasks) {
  const res = await fetch(`${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
    body: JSON.stringify(tasks),
  });
  await assertOk(res, 'writeTasksFile');
  return res.json();
}

/** Read and parse the tasks file's JSON content. */
export async function readTasksFile(accessToken, fileId) {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: authHeaders(accessToken),
  });
  await assertOk(res, 'readTasksFile');
  return res.json();
}

/** Find-or-create the tasks file, then write `tasks` to it. */
export async function saveTasksToDrive(accessToken, tasks) {
  const existing = await findTasksFile(accessToken);
  if (existing) {
    await writeTasksFile(accessToken, existing.id, tasks);
    return existing.id;
  }
  return createTasksFile(accessToken, tasks);
}

/** Load the saved tasks from Drive, or null if nothing has been saved yet. */
export async function loadTasksFromDrive(accessToken) {
  const existing = await findTasksFile(accessToken);
  if (!existing) return null;
  return readTasksFile(accessToken, existing.id);
}
