# Project Task Manager

Сучасний додаток для управління проєктами та завданнями на Vue 3. Табличне та Kanban подання з drag-and-drop функціоналом.

[GitHub Репозиторій](https://github.com/sundevil666/project-task-manager-vue)

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Pinia-yellow?logo=pinia&logoColor=black" alt="Pinia">
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite">
</p>

## Візуальний перегляд

*Скріншоти з'являться скоро*

## Особливості

| Функція | Опис |
|---------|------|
| **Проєкти** | Створення, редагування, статус |
| **Завдання** | Пріоритети, виконавці, дедлайни |
| **Таблиця** | Сортування, фільтрація |
| **Kanban** | Drag & drop робочий процес |

## Стек технологій

- **Vue 3** + Composition API + TypeScript
- **Pinia** — Управління станом
- **Axios** — HTTP клієнт
- **SCSS** — Стилізація
- **vuedraggable** — Drag & drop
- **Vitest** — Тестування

## Початок роботи

```bash
# Встановлення залежностей
npm install

# Запуск сервера розробки
npm run dev
```

Додаток доступний за адресою `http://localhost:5173`

## Збірка

```bash
npm run build      # Production збірка
npm run preview    # Перегляд production
```

## Тестування

```bash
npm run test       # Запуск тестів
npm run test:ui    # Запуск з UI
```

**Покриття:** Projects store, Tasks store, CRUD операції, Getters, Filters

## Демо

*Живе демо з'явиться скоро*

## Деплой

### Vercel (Рекомендовано)

1. Запуште на GitHub
2. Імпортуйте на [Vercel](https://vercel.com)
3. Налаштування: Framework `Vite`, Build `npm run build`, Output `dist`

### GitHub Pages

```ts
// vite.config.ts
export default defineConfig({
  base: '/project-task-manager-vue/',
  // ...
})
```

Увімкніть GitHub Pages у налаштуваннях репозиторію → Деплой через GitHub Actions

## Структура проєкту

```
src/
├── components/     # Vue компоненти
├── pages/          # Сторінки
├── router/         # Конфіг роутінгу
├── store/          # Pinia stores
├── services/       # API сервіси
├── types/          # TypeScript типи
├── styles/         # SCSS стилі
├── mocks/          # Тестові дані
├── utils/          # Утиліти
└── __tests__/      # Юніт-тести
```
