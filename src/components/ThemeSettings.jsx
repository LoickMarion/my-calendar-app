import React, { useState, useRef } from 'react';
import { useThemeStore } from '../state/themeStore.jsx';
import { useTaskStore } from '../state/taskStore.jsx';
import AdvancedOptions from './AdvancedOptions.jsx';

export default function ThemeSettings() {
  const { theme, setThemeVar, resetDefaults } = useThemeStore();
  const { getCategories, getCategoryColor, setCategoryColor } = useTaskStore();
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);

  const cats = getCategories();

  function toHex(val) {
    if (!val) return '#000000';
    if (val.startsWith('#')) return val;
    try {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = val;
      return ctx.fillStyle;
    } catch {
      return '#000000';
    }
  }

  function exportThemeCsv() {
    try {
      const rows = [];
      rows.push('# calendar_theme_export');
      Object.keys(theme).sort().forEach((k) => rows.push([k, String(theme[k] ?? '')]));
      cats.forEach((c) => rows.push([`category:${c}`, String(getCategoryColor(c) ?? '')]));
      const csv = rows
        .map((r) => (Array.isArray(r) ? `${csvEscape(r[0])},${csvEscape(r[1])}` : r))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const filename = `calendar-theme-${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg('');
    } catch (err) {
      console.error(err);
      setMsg('Export failed');
    }
  }

  function handleImportFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split(/\r?\n/);
      lines.forEach((lineRaw) => {
        const line = lineRaw.trim();
        if (!line || line.startsWith('#')) return;
        const idx = line.indexOf(',');
        if (idx < 0) return;
        const key = csvUnescape(line.slice(0, idx).trim());
        const val = csvUnescape(line.slice(idx + 1).trim());
        if (key.startsWith('category:')) {
          setCategoryColor(key.slice(9), val);
        } else setThemeVar(key, val);
      });
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsText(f);
  }

  function csvEscape(val) {
    if (val == null) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function csvUnescape(raw) {
    let s = raw.trim();
    if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1).replace(/""/g, '"');
    return s;
  }

  return (
    <div className="theme-settings-container" style={{ position: 'relative' }}>
      <button className="btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Theme
      </button>

      <div className={`theme-settings-panel ${open ? 'open' : 'closed'}`}>
        <div className="theme-settings-header">
          <strong>Theme Settings</strong>
          <div className="theme-settings-header-buttons">
            <button className="btn" onClick={resetDefaults} title="Reset to defaults">
              Reset
            </button>
            <button className="btn" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>

        <div className="theme-settings-grid">
          {/* Export / Import */}
          <div className="theme-settings-row">
            <div className="theme-settings-row-left">
              <button className="btn" onClick={exportThemeCsv}>
                Export (CSV)
              </button>
              <button className="btn" onClick={() => fileRef.current && fileRef.current.click()}>
                Import (CSV)
              </button>
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleImportFile} />
            </div>
            <div className="theme-settings-msg">{msg}</div>
          </div>

          {/* Font presets */}
          <div className="theme-settings-row">
            <span className="theme-settings-label">Font</span>
            <div className="theme-font-buttons">
              <button className="btn" onClick={() => setThemeVar('font-family', 'system-ui')}>
                System
              </button>
              <button className="btn" onClick={() => setThemeVar('font-family', 'Georgia')}>
                Serif
              </button>
              <button className="btn" onClick={() => setThemeVar('font-family', 'Courier New')}>
                Monospace
              </button>
              <button
                className="btn"
                onClick={() =>
                  setThemeVar(
                    'font-family',
                    "'Lucida Grande', 'Lucida Sans Unicode', 'GNU Unifont', Verdana, Helvetica, sans-serif"
                  )
                }
              >
                Lucida Grande
              </button>
            </div>
          </div>

          {/* Theme colors */}
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
            <label key={entry.key} className="theme-color-row">
              <span>{entry.label}</span>
              <input type="color" value={toHex(theme[entry.key])} onChange={(e) => setThemeVar(entry.key, e.target.value)} />
            </label>
          ))}

          {/* Category bubble colors */}
          <div className="theme-category-colors">
            <strong>Category bubble colors</strong>
            <div className="category-color-grid">
              {cats.length === 0 ? (
                <div className="no-categories">No categories found yet</div>
              ) : (
                cats.map((c) => (
                  <label key={c} className="category-color-label">
                    <div className="category-color-swatch" style={{ background: getCategoryColor(c) }} />
                    <span>{c}</span>
                    <input type="color" value={toHex(getCategoryColor(c))} onChange={(e) => setCategoryColor(c, e.target.value)} />
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Advanced Options */}
          <AdvancedOptions theme={theme} setThemeVar={setThemeVar} />
        </div>
      </div>
    </div>
  );
}
