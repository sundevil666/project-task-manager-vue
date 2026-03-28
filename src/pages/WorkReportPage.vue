<template>
  <section class="work-report">
    <header class="report-header">
      <p class="eyebrow">Документація проєкту</p>
      <h1>Звіт про виконану роботу</h1>
      <p class="lead">
        Ця сторінка містить короткий підсумок того, що вже реалізовано в TaskFlow.
      </p>
    </header>

    <article class="report-card">
      <h2>Що вже зроблено</h2>

      <h3>1. Керування проєктами</h3>
      <ul>
        <li>Реалізовано список проєктів у вигляді таблиці.</li>
        <li>Додано створення та редагування проєктів через модальне вікно.</li>
        <li>Налаштовано сортування за ID, назвою, статусом і кількістю задач.</li>
        <li>Додано фільтрацію за назвою та статусом.</li>
      </ul>

      <h3>2. Робота із задачами</h3>
      <ul>
        <li>Реалізовано відображення задач у форматі Kanban (статусні колонки).</li>
        <li>Додано створення та редагування задач.</li>
        <li>Підключено зв'язок задач із конкретними проєктами.</li>
      </ul>

      <h3>3. Візуалізація та аналітика</h3>
      <ul>
        <li>Додано графік розподілу задач за статусами.</li>
        <li>Реалізовано інформаційну панель для зручного перегляду активності.</li>
      </ul>

      <h3>4. Стан застосунку та збереження даних</h3>
      <ul>
        <li>Налаштовано керування станом через Pinia.</li>
        <li>Додано збереження налаштувань таблиці в localStorage.</li>
        <li>Реалізовано базову обробку помилок та завантаження даних.</li>
      </ul>

      <h3>5. Якість коду</h3>
      <ul>
        <li>Додано unit-тести для основних store-модулів.</li>
        <li>Налаштовано ESLint та базову структуру проєкту для підтримки масштабу.</li>
      </ul>

      <h2>Поточний результат</h2>
      <p>
        На даному етапі застосунок уже покриває базовий цикл керування проєктами та задачами:
        від створення і редагування до перегляду стану у вигляді таблиць, Kanban-дошки та графіків.
      </p>
      <p>
        Репозиторій проєкту:
        <a href="https://github.com/sundevil666/project-task-manager-vue" target="_blank" rel="noopener noreferrer">
          github.com/sundevil666/project-task-manager-vue
        </a>
      </p>
    </article>
  </section>
</template>

<style scoped lang="scss">
.work-report {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.report-header {
  margin-bottom: 1.5rem;

  h1 {
    margin: 0.5rem 0;
    color: #111827;
  }
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #2563eb;
  font-weight: 700;
  margin: 0;
}

.lead {
  margin: 0;
  color: #4b5563;
}

.report-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  line-height: 1.6;

  h2 {
    margin-top: 0;
    color: #111827;
  }

  h3 {
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  p {
    color: #374151;
  }
}
</style>
