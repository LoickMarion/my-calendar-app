// CategoriesFilter.jsx
// Renders a list of category checkboxes with Select All / Deselect All controls.

import React from 'react';
import { useTaskStore } from '../state/taskStore.jsx';


export default function CategoriesFilter() {
  const { getCategories, getCategoryCounts, getCategoryColor, isCategoryEnabled, setCategoryEnabled, toggleAllCategories } = useTaskStore();

  const categories = getCategories();
  const counts = getCategoryCounts();

  function getColor(cat) { try { return getCategoryColor(cat); } catch (e) { return 'hsl(220 60% 60%)'; } }

  if (!categories || categories.length === 0) return null;

  return (
    <aside className="categories-filter">
      <div className="categories-controls" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button onClick={() => toggleAllCategories(true)} aria-label="Select all">Select all</button>
        <button onClick={() => toggleAllCategories(false)} aria-label="Deselect all">Deselect all</button>
      </div>

      <ul className="category-list" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
        {categories.map((cat) => (
          <li key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.15rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={isCategoryEnabled(cat)} onChange={(e) => setCategoryEnabled(cat, e.target.checked)} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="category-swatch" style={{ width: 12, height: 12, display: 'inline-block', borderRadius: 3, background: getColor(cat) }} />
                <span>{cat}</span>
              </span>
            </label>
            <span className="category-count" style={{ color: '#666', fontSize: '0.9rem' }}>{counts[cat] || 0}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
