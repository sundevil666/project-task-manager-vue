<script setup lang="ts">
</script>

<template>
  <div class="app">
    <header class="header">
      <img src="/logo.svg" alt="TaskFlow Logo" class="logo" />
      <h1 class="title">TaskFlow</h1>
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
  text-align: left;
}
</style>
