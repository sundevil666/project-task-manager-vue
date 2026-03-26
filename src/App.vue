<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="app">
    <header class="header">
      <img src="/logo.svg" alt="TaskFlow Logo" class="logo" />
      <h1 class="title">TaskFlow</h1>
    </header>
    
    <main class="main">
      <div class="hero">
        <h2>Управляйте задачами эффективно</h2>
        <p>Современный менеджер проектов для командной работы</p>
        <div class="features">
          <div class="feature">
            <h3>📋 Простота</h3>
            <p>Интуивный интерфейс для быстрого старта</p>
          </div>
          <div class="feature">
            <h3>🚀 Производительность</h3>
            <p>Быстрая работа с задачами без задержек</p>
          </div>
          <div class="feature">
            <h3>👥 Команда</h3>
            <p>Совместная работа в реальном времени</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <button type="button" @click="count++">Кликов: {{ count }}</button>
        <p>
          Начните работу с
          <code>src/App.vue</code>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.logo {
  width: 48px;
  height: 48px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4F46E5;
  margin: 0;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.hero {
  text-align: center;
}

.hero h2 {
  font-size: 2rem;
  color: #1F2937;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #6B7280;
  margin-bottom: 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature {
  padding: 1.5rem;
  border-radius: 12px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
}

.feature h3 {
  font-size: 1.2rem;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #6B7280;
  margin: 0;
}

.card {
  padding: 2em;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #4F46E5;
  color: white;
  cursor: pointer;
  transition: all 0.25s;
}

button:hover {
  background-color: #4338CA;
  transform: translateY(-1px);
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>
