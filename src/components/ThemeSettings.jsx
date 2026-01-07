import React, { useState } from 'react';
import { useThemeStore } from '../state/themeStore.jsx';
import { useTaskStore } from '../state/taskStore.jsx';

export default function ThemeSettings() {
  const { theme, setThemeVar, resetDefaults } = useThemeStore();
  const { getCategories, getCategoryColor, setCategoryColor } = useTaskStore();
  const [open, setOpen] = useState(false);
  const fileRef = React.useRef(null);
  const [msg, setMsg] = useState(null);

  const cats = getCategories();

  function csvEscape(val) {
    if (val == null) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function csvUnescape(raw) {
    let s = raw.trim();
    if (s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1).replace(/""/g, '"');
    }
    return s;
  }

  function exportThemeCsv() {
    try {
      const rows = [];
      rows.push('# calendar_theme_export');
      // theme entries
      Object.keys(theme).sort().forEach((k) => {
        rows.push([k, String(theme[k] ?? '')]);
      });
      // category colors
      cats.forEach((c) => {
        rows.push([`category:${c}`, String(getCategoryColor(c) ?? '')]);
      });

      const csv = rows.map((r) => Array.isArray(r) ? `${csvEscape(r[0])},${csvEscape(r[1])}` : r).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const filename = `calendar-theme-${new Date().toISOString().slice(0,10)}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg('Exported theme to ' + filename);
    } catch (err) {
      console.error(err);
      setMsg('Export failed');
    }
  }

  function handleImportFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const txt = reader.result;
      try {
        const lines = String(txt).split(/\r?\n/);
        let applied = 0;
        lines.forEach((ln) => {
          const line = ln.trim();
          if (!line || line.startsWith('#')) return;
          const idx = line.indexOf(',');
          if (idx < 0) return;
          const rawKey = line.slice(0, idx).trim();
          const rawVal = line.slice(idx + 1).trim();
          const key = csvUnescape(rawKey);
          const val = csvUnescape(rawVal);
          if (key.startsWith('category:')) {
            const cat = key.slice('category:'.length);
            setCategoryColor(cat, val);
            applied++;
          } else {
            setThemeVar(key, val);
            applied++;
          }
        });
        setMsg(``);
      } catch (err) {
        console.error(err);
        setMsg('Import failed');
      } finally {
        // reset input so same file can be re-imported
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setMsg('Failed to read file');
    };
    reader.readAsText(f);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="theme-settings">Theme</button>

      {open && (
        <div id="theme-settings" style={{ position: 'absolute', right: 0, top: '2.5rem', zIndex: 40, width: 360, padding: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: 8, background: 'var(--widget-bg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Theme Settings</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { resetDefaults(); }} title="Reset to defaults">Reset</button>
              <button onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={exportThemeCsv}>Export (CSV)</button>
                <button onClick={() => fileRef.current && fileRef.current.click()}>Import (CSV)</button>
                <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleImportFile} style={{ display: 'none' }} />
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9em' }}>{msg}</div>
            </div>

            {/* Font presets (click to apply) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>Font</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => setThemeVar('font-family', 'system-ui')}>System</button>
                <button onClick={() => setThemeVar('font-family', 'Georgia')}>Serif</button>
                <button onClick={() => setThemeVar('font-family', 'Courier New')}>Monospace</button>
                <button onClick={() => setThemeVar('font-family', "'Lucida Grande', 'Lucida Sans Unicode', 'GNU Unifont', Verdana, Helvetica, sans-serif")}>Lucida Grande</button>
              </div>
            </div>

            {[
              { key: 'app-bg', label: 'App background' },
              { key: 'widget-bg', label: 'Widget background' },
              { key: 'text-color', label: 'Main text color' },
              { key: 'border-color', label: 'Border color' },
              { key: 'tile-bg', label: 'Calendar tile background' },
              { key: 'tile-border', label: 'Calendar tile border' },
              { key: 'tile-highlight', label: 'Calendar tile highlight' },
              { key: 'checkbox-check', label: 'Checkbox check color' },
              { key: 'checkbox-bg', label: 'Checkbox background (checked)' },
              { key: 'bullet-color', label: 'Bullet color (daily view)' }
            ].map((entry) => (
              <label key={entry.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span>{entry.label}</span>
                <input type="color" value={toHex(theme[entry.key])} onChange={(e) => setThemeVar(entry.key, e.target.value)} />
              </label>
            ))}

            <hr />

            <details>
              <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Advanced options (background shapes)</summary>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span>Density</span>
                <input type="range" min={4} max={60} value={theme['shapes-density'] || '18'} onChange={(e) => setThemeVar('shapes-density', String(e.target.value))} />
              </label>

              {['hearts', 'circles', 'stars', 'clouds', 'triangles', 'sparkles'].map((s) => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={theme[`shape-${s}-enabled`] === 'true' || theme[`shape-${s}-enabled`] === true} onChange={(e) => setThemeVar(`shape-${s}-enabled`, e.target.checked ? 'true' : 'false')} />
                    <span style={{ textTransform: 'capitalize' }}>{s}</span>
                  </div>
                  <input type="color" value={toHex(theme[`shape-${s}-color`])} onChange={(e) => setThemeVar(`shape-${s}-color`, e.target.value)} />
                </label>
              ))}

              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span>Opacity</span>
                  <input type="range" min={0.02} max={0.6} step={0.02} value={Number(theme['shapes-opacity'] || '0.18')} onChange={(e) => setThemeVar('shapes-opacity', String(e.target.value))} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span>Size multiplier</span>
                  <input type="range" min={50} max={300} value={Math.round(Number(theme['shapes-size'] || 1.0) * 100)} onChange={(e) => setThemeVar('shapes-size', String(Number(e.target.value) / 100))} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span>Render on top of widgets</span>
                  <input type="checkbox" checked={theme['shapes-on-top'] === 'true' || theme['shapes-on-top'] === true} onChange={(e) => setThemeVar('shapes-on-top', e.target.checked ? 'true' : 'false')} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span>Random seed (optional)</span>
                  <input type="text" value={theme['shapes-seed'] || ''} onChange={(e) => setThemeVar('shapes-seed', e.target.value)} style={{ width: 120 }} />
                </label>

                <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: '0.9em' }}>Toggle shapes and pick colors; positions are generated deterministically from the seed so they persist.</div>
              </div>
            </details>

            <hr />
            <div>
              <strong>Category bubble colors</strong>
              <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                {cats.length === 0 ? (
                  <div style={{ color: 'var(--muted)' }}>No categories found yet</div>
                ) : (
                  cats.map((c) => (
                    <label key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 12, height: 12, background: getCategoryColor(c), borderRadius: 6, border: '1px solid var(--border-color)' }} />
                        <span>{c}</span>
                      </div>
                      <input type="color" value={toHex(getCategoryColor(c))} onChange={(e) => setCategoryColor(c, e.target.value)} />
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toHex(val) {
  // If val is already hex, return it; if it's hsl(...) or rgb(...), try to leave as-is by returning a computed hex fallback
  if (!val) return '#000000';
  if (val.startsWith('#')) return val;
  // Attempt conversion for hsl/hsl with spaces (simple conversion using canvas) - best-effort
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = val;
    return ctx.fillStyle;
  } catch (err) {
    return '#000000';
  }
}