<template>
  <div class="projects-page">
    <div class="projects-header">
      <h1>Projects</h1>
      <button class="btn btn--primary">Добавить проект</button>
    </div>
    
    <div class="projects-table-container">
      <table class="projects-table">
        <thead>
          <tr>
            <th>ID проекта</th>
            <th>Название проекта</th>
            <th>Количество задач</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td>{{ project.id }}</td>
            <td>{{ project.name }}</td>
            <td>{{ project.taskCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Project {
  id: number
  name: string
  taskCount: number
}

const projects = ref<Project[]>([
  { id: 1, name: 'Website Redesign', taskCount: 12 },
  { id: 2, name: 'Mobile App', taskCount: 8 },
  { id: 3, name: 'API Integration', taskCount: 5 }
])
</script>

<style scoped>
.projects-page {
  padding: 2rem;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

.projects-table-container {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  
  th {
    background-color: #f9fafb;
    font-weight: 600;
    text-align: left;
    padding: 1rem;
    border-bottom: 2px solid #e5e7eb;
    color: #1f2937;
  }
  
  td {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
  }
  
  tbody tr {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f9fafb;
    }
  }
  
  tbody tr:last-child td {
    border-bottom: none;
  }
}
</style>
