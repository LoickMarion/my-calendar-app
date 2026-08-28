import React, { useEffect, useRef, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { csvToTasks } from '../../data/parseCsv.js';
import { useTaskStore } from '../../state/taskStore/index.jsx';
import CaseText from '../CaseText.jsx';

const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const PICKER_API_KEY = import.meta.env.PROD
  ? import.meta.env.VITE_GOOGLE_PICKER_API_KEY_PROD
  : import.meta.env.VITE_GOOGLE_PICKER_API_KEY_DEV;

let gapiPickerPromise = null;

/** Load the Google API script + the Picker module, once, and cache the promise. */
function loadGapiPicker() {
  if (gapiPickerPromise) return gapiPickerPromise;

  gapiPickerPromise = new Promise((resolve, reject) => {
    function onGapiReady() {
      window.gapi.load('picker', {
        callback: () => resolve(window.google.picker),
        onerror: () => reject(new Error('Failed to load Google Picker')),
      });
    }

    if (window.gapi) {
      onGapiReady();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = onGapiReady;
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.head.appendChild(script);
  });

  return gapiPickerPromise;
}

export default function ImportControls({ isSignedIn }) {
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [replace, setReplace] = useState(true);
  const [status, setStatus] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { importTasks } = useTaskStore();

  // Close the import menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function applyCsvText(text) {
    try {
      const newTasks = csvToTasks(text);
      const dateCount = Object.keys(newTasks).length;
      if (dateCount === 0) {
        setStatus('No tasks found in CSV');
        return;
      }
      importTasks(newTasks, { replace });
      const taskCount = Object.values(newTasks).reduce((s, a) => s + a.length, 0);
      setStatus(`Imported ${taskCount} tasks across ${dateCount} dates`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to parse CSV: ' + err.message);
    }
  }

  // --- Local file import ---

  function handleLocalButtonClick() {
    setMenuOpen(false);
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => applyCsvText(reader.result);
    reader.onerror = () => setStatus('Failed to read file');
    reader.readAsText(file);

    e.target.value = ''; // reset so same file can be re-imported
  }

  // --- Google Drive import ---

  async function openDrivePicker(accessToken) {
    if (!PICKER_API_KEY) {
      setStatus('VITE_GOOGLE_PICKER_API_KEY is not set — cannot open Google Drive picker');
      return;
    }

    try {
      const picker = await loadGapiPicker();

      const view = new picker.DocsView(picker.ViewId.DOCS)
        .setMimeTypes('text/csv,text/plain')
        .setIncludeFolders(true);

      new picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(PICKER_API_KEY)
        .setCallback((data) => handlePickerResponse(data, accessToken, picker))
        .build()
        .setVisible(true);
    } catch (err) {
      console.error(err);
      setStatus('Failed to open Google Drive picker: ' + err.message);
    }
  }

  async function handlePickerResponse(data, accessToken, picker) {
    if (data.action !== picker.Action.PICKED) return;

    const file = data.docs?.[0];
    if (!file) return;

    setStatus('Loading file from Drive…');
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error(`Drive fetch failed: ${res.status}`);
      const text = await res.text();
      applyCsvText(text);
    } catch (err) {
      console.error(err);
      setStatus('Failed to load file from Drive: ' + err.message);
    }
  }

  const requestDriveAccess = useGoogleLogin({
    flow: 'implicit',
    scope: DRIVE_FILE_SCOPE,
    onSuccess: (tokenResponse) => openDrivePicker(tokenResponse.access_token),
    onError: () => setStatus('Google Drive access was not granted'),
  });

  function handleDriveButtonClick() {
    setMenuOpen(false);
    requestDriveAccess();
  }

  return (
    <div className="import-controls" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="import-menu" ref={menuRef}>
        <button
          className="btn"
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
        >
          <CaseText>Import</CaseText>
        </button>

        {menuOpen && (
          <div className="import-menu-dropdown">
            <button className="import-menu-item" type="button" onClick={handleLocalButtonClick}>
              <CaseText>From Computer</CaseText>
            </button>
            {isSignedIn && (
              <button className="import-menu-item" type="button" onClick={handleDriveButtonClick}>
                <CaseText>From Google Drive</CaseText>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input, shared by both cases */}
      <input
        type="file"
        accept=".csv,text/csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Replace toggle */}
      <div className="replace-toggle">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={replace}
            onChange={(e) => setReplace(e.target.checked)}
          />
          <span className="checkbox-custom" />
        </label>

        <label className="replace-label">
          <CaseText>Replace Existing Tasks</CaseText>
        </label>
      </div>

      {status && <span className="file-instruction">{status}</span>}
    </div>
  );
}
