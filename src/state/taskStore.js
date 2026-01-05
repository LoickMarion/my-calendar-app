// taskStore.js
// Backward-compat re-export. The implementation uses JSX so the real file is `taskStore.jsx`.
// Keep this small shim so imports that omit the extension continue to work.

export * from './taskStore.jsx';
export { default } from './taskStore.jsx';
