# Project Task Manager

Сучасний додаток для управління проєктами та завданнями на Vue 3. Табличне та Kanban подання з drag-and-drop функціоналом.

[GitHub Репозиторій](https://github.com/sundevil666/project-task-manager-vue) • [Живе демо](https://sundevil666.github.io/project-task-manager-vue/#/)

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

**[Живе демо →](https://sundevil666.github.io/project-task-manager-vue/#/)**

## Деплой

### GitHub Pages (Автоматично)

Проєкт автоматично деплоїться на GitHub Pages при кожному пуші в `main`.

**Як це працює:**
- GitHub Actions workflow (`.github/workflows/deploy.yml`) запускається на кожен пуш в `main`
- Встановлює залежності через `npm ci`
- Збирає проєкт командою `npm run build`
- Деплоїть папку `/dist` в гілку `gh-pages`
- Сайт оновлюється автоматично за 1–2 хвилини

**URL додатка:**  
https://sundevil666.github.io/project-task-manager-vue/#/

**Перше налаштування:**
1. Перейдіть у **Settings → Pages** у вашому GitHub репозиторії
2. Встановіть **Source** на `Deploy from a branch`
3. Оберіть гілку `gh-pages` та папку `/ (root)`
4. Натисніть **Save** — наступні пуші в `main` будуть автодеплоїтись

### Vercel (Альтернатива)

1. Запуште на GitHub
2. Імпортуйте на [Vercel](https://vercel.com)
3. Налаштування: Framework `Vite`, Build `npm run build`, Output `dist`

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
