// googleDriveTheme.js
// Plain-fetch helpers for reading/writing a single theme JSON file in the
// user's Google Drive, using the drive.file scope already granted at login.

const THEME_FILENAME = 'pookie-calendar-theme.json';
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

/** Find the theme file by name. Returns { id } or null. */
export async function findThemeFile(accessToken) {
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(
    `name='${THEME_FILENAME}' and trashed=false`
  )}&fields=${encodeURIComponent('files(id)')}`;

  const res = await fetch(url, { headers: authHeaders(accessToken) });
  await assertOk(res, 'findThemeFile');

  const data = await res.json();
  const file = (data.files || [])[0];
  return file ? { id: file.id } : null;
}

/** Create the theme file with the given content. Returns the new file id. */
export async function createThemeFile(accessToken, theme) {
  const metadata = { name: THEME_FILENAME };
  const body = new FormData();
  body.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  body.append('file', new Blob([JSON.stringify(theme)], { type: 'application/json' }));

  const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body,
  });
  await assertOk(res, 'createThemeFile');

  const data = await res.json();
  return data.id;
}

/** Overwrite the theme file's content. */
export async function writeThemeFile(accessToken, fileId, theme) {
  const res = await fetch(`${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
    body: JSON.stringify(theme),
  });
  await assertOk(res, 'writeThemeFile');
  return res.json();
}

/** Read and parse the theme file's JSON content. */
export async function readThemeFile(accessToken, fileId) {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: authHeaders(accessToken),
  });
  await assertOk(res, 'readThemeFile');
  return res.json();
}

/** Find-or-create the theme file, then write `theme` to it. */
export async function saveThemeToDrive(accessToken, theme) {
  const existing = await findThemeFile(accessToken);
  if (existing) {
    await writeThemeFile(accessToken, existing.id, theme);
    return existing.id;
  }
  return createThemeFile(accessToken, theme);
}

/** Load the saved theme from Drive, or null if nothing has been saved yet. */
export async function loadThemeFromDrive(accessToken) {
  const existing = await findThemeFile(accessToken);
  if (!existing) return null;
  return readThemeFile(accessToken, existing.id);
}
