# Project Task Manager

A modern project and task management application built with Vue 3. Features flexible Table and Kanban views with drag-and-drop functionality.

[GitHub Repository](https://github.com/sundevil666/project-task-manager-vue) • [Live Demo](https://sundevil666.github.io/project-task-manager-vue/#/)

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Pinia-yellow?logo=pinia&logoColor=black" alt="Pinia">
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite">
</p>

## Visual Preview

*Screenshots coming soon*

## Features

| Feature | Description |
|---------|-------------|
| **Projects** | Create, edit, track status |
| **Tasks** | Priorities, assignees, due dates |
| **Table View** | Sortable data grid |
| **Kanban Board** | Drag & drop workflow |

## Tech Stack

- **Vue 3** + Composition API + TypeScript
- **Pinia** — State management
- **Axios** — HTTP client
- **SCSS** — Styling
- **vuedraggable** — Drag & drop
- **Vitest** — Testing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at `http://localhost:5173`

## Build

```bash
npm run build      # Production build
npm run preview    # Preview production build
```

## Testing

```bash
npm run test       # Run tests
npm run test:ui    # Run tests with UI
```

**Coverage:** Projects store, Tasks store, CRUD actions, Getters, Filters

## Demo

**[Live Demo →](https://sundevil666.github.io/project-task-manager-vue/#/)**

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import on [Vercel](https://vercel.com)
3. Settings: Framework `Vite`, Build `npm run build`, Output `dist`

### GitHub Pages

```ts
// vite.config.ts
export default defineConfig({
  base: '/project-task-manager-vue/',
  // ...
})
```

Enable GitHub Pages in repo settings → Deploy via GitHub Actions

## Project Structure

```
src/
├── components/     # Vue components
├── pages/          # Route pages
├── router/         # Routing config
├── store/          # Pinia stores
├── services/       # API services
├── types/          # TypeScript types
├── styles/         # SCSS styles
├── mocks/          # Mock data
├── utils/          # Utilities
└── __tests__/      # Unit tests
```
