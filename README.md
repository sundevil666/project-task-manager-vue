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

### GitHub Pages (Automated)

The project automatically deploys to GitHub Pages on every push to `main`.

**How it works:**
- GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers on each push to `main`
- Installs dependencies with `npm ci`
- Builds the project with `npm run build`
- Deploys the `/dist` folder to the `gh-pages` branch
- Site updates automatically within 1–2 minutes

**Live URL:**  
https://sundevil666.github.io/project-task-manager-vue/#/

**First-time setup:**
1. Go to **Settings → Pages** in your GitHub repo
2. Set **Source** to `Deploy from a branch`
3. Select `gh-pages` branch and `/ (root)` folder
4. Click **Save** — subsequent pushes to `main` will auto-deploy

### Vercel (Alternative)

1. Push to GitHub
2. Import on [Vercel](https://vercel.com)
3. Settings: Framework `Vite`, Build `npm run build`, Output `dist`

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
