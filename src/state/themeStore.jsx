import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const DEFAULT_THEME = {
  'app-bg': '#ffffff',
  'widget-bg': '#ffffff',
  'text-color': '#000000',
  'muted': '#888888',
  'accent': '#2563eb',
  'border-color': 'rgb(0,0,0)',
  'tile-bg': '#ffffff',
  'tile-border': 'rgb(0,0,0)',
  'tile-highlight': '#2563eb',
  'checkbox-check': '#ffffff',
  'checkbox-bg': '#2563eb',
  'bullet-color': '#888888',
  'category-bubble-text': '#ffffff',

  /* Font */
  'font-family': 'system-ui',

  /* Background shapes advanced options */
  'shapes-density': '18',
  'shapes-seed': String(Math.floor(Math.random() * 1000000)),
  'shape-hearts-enabled': 'false',
  'shape-hearts-color': '#ff6b6b',
  'shape-circles-enabled': 'false',
  'shape-circles-color': '#b3cde0',
  'shape-stars-enabled': 'false',
  'shape-stars-color': '#ffd166',
  'shape-clouds-enabled': 'false',
  'shape-clouds-color': '#e0e7ff',
  'shape-triangles-enabled': 'false',
  'shape-triangles-color': '#a0d2a8',
  'shape-sparkles-enabled': 'false',
  'shape-sparkles-color': '#f0e68c',

  /* visibility controls */
  'shapes-opacity': '0.18',
  'shapes-size': '1.0',
  'shapes-on-top': 'false'
};

function applyTheme(theme) {
  Object.entries(theme).forEach(([k, v]) => {
    try {
      document.documentElement.style.setProperty(`--${k}`, v);
    } catch (err) {
      // ignore
    }
  });
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // Load saved theme once
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calendar_theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTheme((prev) => ({ ...prev, ...parsed }));
        applyTheme({ ...DEFAULT_THEME, ...parsed });
      } else {
        applyTheme(DEFAULT_THEME);
      }
    } catch (err) {
      console.warn('Failed to load theme settings:', err);
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  // Dynamically load webfonts when selected (e.g., Inter)
  useEffect(() => {
    try {
      const ff = theme['font-family'];
      if (ff === 'Inter') {
        if (!document.querySelector('link[data-font="inter"]')) {
          const l = document.createElement('link');
          l.rel = 'stylesheet';
          l.dataset.font = 'inter';
          l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
          document.head.appendChild(l);
        }
      }
    } catch (err) {
      // ignore
    }
  }, [theme['font-family']]);

  // Persist and apply changes
  useEffect(() => {
    try {
      localStorage.setItem('calendar_theme', JSON.stringify(theme));
      applyTheme(theme);
    } catch (err) {
      console.warn('Failed to persist theme:', err);
    }
  }, [theme]);

  function setThemeVar(key, value) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setTheme(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
  }

  return (
    <ThemeContext.Provider value={{ theme, setThemeVar, resetDefaults }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeStore() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeStore must be used within ThemeProvider');
  return ctx;
}
