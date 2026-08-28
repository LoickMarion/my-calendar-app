import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  findThemeFile,
  createThemeFile,
  writeThemeFile,
  readThemeFile,
  saveThemeToDrive,
  loadThemeFromDrive,
} from '../src/data/googleDriveTheme.js';

function mockFetch(response, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('findThemeFile', () => {
  it('sends an authorized GET filtered by filename and returns the first match', async () => {
    global.fetch = mockFetch({ files: [{ id: 'file-1' }] });

    const result = await findThemeFile('token-123');

    expect(result).toEqual({ id: 'file-1' });
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toContain(encodeURIComponent("name='pookie-calendar-theme.json'"));
    expect(opts.headers.Authorization).toBe('Bearer token-123');
  });

  it('returns null when no file exists', async () => {
    global.fetch = mockFetch({ files: [] });
    const result = await findThemeFile('token-123');
    expect(result).toBeNull();
  });

  it('throws on a non-ok response', async () => {
    global.fetch = mockFetch({}, false);
    await expect(findThemeFile('token-123')).rejects.toThrow(/findThemeFile failed/);
  });
});

describe('createThemeFile', () => {
  it('POSTs a multipart body with the theme content', async () => {
    global.fetch = mockFetch({ id: 'new-file-id' });

    const id = await createThemeFile('token-123', { accent: 'blue' });

    expect(id).toBe('new-file-id');
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toContain('uploadType=multipart');
    expect(opts.method).toBe('POST');
    expect(opts.headers.Authorization).toBe('Bearer token-123');
    expect(opts.body).toBeInstanceOf(FormData);
  });
});

describe('writeThemeFile', () => {
  it('PATCHes the file content as JSON', async () => {
    global.fetch = mockFetch({ id: 'file-1' });

    await writeThemeFile('token-123', 'file-1', { accent: 'green' });

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toContain('/files/file-1');
    expect(url).toContain('uploadType=media');
    expect(opts.method).toBe('PATCH');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opts.body)).toEqual({ accent: 'green' });
  });
});

describe('readThemeFile', () => {
  it('GETs the file content with alt=media', async () => {
    global.fetch = mockFetch({ accent: 'purple' });

    const result = await readThemeFile('token-123', 'file-1');

    expect(result).toEqual({ accent: 'purple' });
    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/files/file-1');
    expect(url).toContain('alt=media');
  });
});

describe('saveThemeToDrive', () => {
  it('writes to an existing file when one is found', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [{ id: 'existing-id' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'existing-id' }) });

    const fileId = await saveThemeToDrive('token-123', { accent: 'red' });

    expect(fileId).toBe('existing-id');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[1][0]).toContain('/files/existing-id');
  });

  it('creates a new file when none is found', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'created-id' }) });

    const fileId = await saveThemeToDrive('token-123', { accent: 'red' });

    expect(fileId).toBe('created-id');
    expect(global.fetch.mock.calls[1][1].method).toBe('POST');
  });
});

describe('loadThemeFromDrive', () => {
  it('returns null when no remote file exists', async () => {
    global.fetch = mockFetch({ files: [] });
    const result = await loadThemeFromDrive('token-123');
    expect(result).toBeNull();
  });

  it('reads and returns the remote theme when a file exists', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [{ id: 'file-1' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ accent: 'orange' }) });

    const result = await loadThemeFromDrive('token-123');
    expect(result).toEqual({ accent: 'orange' });
  });
});
