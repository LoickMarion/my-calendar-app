# Pookie Calendar

A React + Vite calendar app for tracking tasks by day and month, with drag-and-drop scheduling, category filters, theming, and celebration animations when tasks are completed.

## Features

- Month grid and day-view layouts
- Drag-and-drop tasks between days (via `@dnd-kit`)
- Category filters and completed-task filtering
- Select / delete / edit interaction modes
- Customizable theme (bullet points, background shapes, animations)
- Celebration effects (confetti, fireworks, sparkles) on task completion
- Task data loaded from a local `tasks.json`, or optionally from a public Google Sheet

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview a production build:

```bash
npm run preview
```

## Loading tasks from Google Sheets

By default, tasks are loaded from `src/data/tasks.json`. To load from a public Google Sheet instead, set the following in a `.env` file at the project root:

```
VITE_SHEET_ID=your-sheet-id
VITE_SHEET_NAME=optional-sheet-name
```

## Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [@dnd-kit](https://dndkit.com/) 
- [Tailwind CSS](https://tailwindcss.com/) 