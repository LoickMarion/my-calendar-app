import React, { useState } from 'react';
import { useTaskStore } from '../state/taskStore.jsx';

export default function CategoriesFilter({ mode = 'select' }) {
  const {
    getCategories,
    getCategoryCounts,
    getCategoryColor,
    isCategoryEnabled,
    setCategoryEnabled,
    toggleAllCategories,
    deleteCategory,
    renameCategory, // new
  } = useTaskStore();

  const categories = getCategories();
  const counts = getCategoryCounts();
  const [editing, setEditing] = useState(null); // currently editing category
  const [newName, setNewName] = useState('');

  function getColor(cat) {
    try {
      return getCategoryColor(cat);
    } catch (e) {
      return 'hsl(220 60% 60%)';
    }
  }

  if (!categories || categories.length === 0) return null;

  return (
    <aside className="categories-filter">
      <div
        className="categories-controls"
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}
      >
        <button onClick={() => toggleAllCategories(true)} aria-label="Select all">
          Select all
        </button>
        <button onClick={() => toggleAllCategories(false)} aria-label="Deselect all">
          Deselect all
        </button>
      </div>

      <ul className="category-list" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
        {categories.map((cat) => {
          const enabled = isCategoryEnabled(cat);

          // Determine the right-hand control based on mode
          let control = null;
          if (mode === 'select') {
            control = (
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setCategoryEnabled(cat, e.target.checked)}
              />
            );
          } else if (mode === 'delete') {
            control = (
              <button
                type="button"
                onClick={() => deleteCategory(cat)}
                style={{
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  width: 20,
                  height: 20,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
                aria-label={`Delete category ${cat}`}
              >
                ✕
              </button>
            );
          } else if (mode === 'edit') {
            if (editing === cat) {
              // show input for renaming
              control = (
                <input
                  type="text"
                  value={newName}
                  autoFocus
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => {
                    if (newName.trim() && newName !== cat) renameCategory(cat, newName.trim());
                    setEditing(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (newName.trim() && newName !== cat) renameCategory(cat, newName.trim());
                      setEditing(null);
                    }
                    if (e.key === 'Escape') {
                      setEditing(null);
                    }
                  }}
                  style={{ width: 80 }}
                />
              );
            } else {
              // pencil button to trigger input
              control = (
                <div
                  style={{
                    background: '#eee',
                    color: '#333',
                    borderRadius: 4,
                    width: 20,
                    height: 20,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label={`Edit category ${cat}`}
                  onClick={() => {
                    setEditing(cat);
                    setNewName(cat);
                  }}
                >
                  ✎
                </div>
              );
            }
          }

          return (
            <li
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.15rem 0',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    className="category-swatch"
                    style={{
                      width: 12,
                      height: 12,
                      display: 'inline-block',
                      borderRadius: 3,
                      background: getColor(cat),
                    }}
                  />
                  <span>{cat}</span>
                </span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span className="category-count" style={{ color: '#666', fontSize: '0.9rem' }}>
                  {counts[cat] || 0}
                </span>
                {control}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
