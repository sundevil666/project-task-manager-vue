<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isWorkReportPage = computed(() => route.name === 'WorkReport')
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="brand">
        <img src="/logo.svg" alt="TaskFlow Logo" class="logo" />
        <h1 class="title">TaskFlow</h1>
      </div>
      <RouterLink
        :to="isWorkReportPage ? '/' : '/work-report'"
        class="report-btn"
      >
        {{ isWorkReportPage ? 'Назад до проєктів' : 'Звіт про роботу' }}
      </RouterLink>
    </header>
    
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 1680px;
  margin: 0 auto;
  padding: 2rem;
  text-align: left;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.report-btn {
  display: inline-block;
  padding: 0.7rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.report-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.main {
  text-align: left;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
