<template>
  <div class="projects-page">
    <div class="projects-header">
      <h1>Projects</h1>
      <button class="btn btn--primary" @click="openModal">Добавить проект</button>
    </div>

    <div class="dashboard">
      <TaskStatusChart class="chart-section" />
      <div class="projects-table-container">
        <div v-if="isLoading" class="loading-state">
          Loading...
        </div>
        <table v-else class="projects-table">
          <thead>
            <tr>
              <th>ID проекта</th>
              <th>Название проекта</th>
              <th>Количество задач</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <ProjectRow
              v-for="project in projects"
              :key="project.id"
              :project="project"
            />
          </tbody>
        </table>
      </div>
    </div>

    <AddProjectModal
      :is-open="isModalOpen"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import ProjectRow from '../components/ProjectRow.vue'
import AddProjectModal from '../components/AddProjectModal.vue'
import TaskStatusChart from '../components/TaskStatusChart.vue'
import { useProjectsStore } from '../store/projects'
import { useTaskStore } from '../store/tasks'
import { useAppStore } from '../store/index'

const projectsStore = useProjectsStore()
const taskStore = useTaskStore()
const appStore = useAppStore()

const { getAllProjects: projects } = storeToRefs(projectsStore)
const { isLoading } = storeToRefs(appStore)

const isModalOpen = ref(false)

onMounted(async () => {
  await Promise.all([
    projectsStore.fetchProjects(),
    taskStore.fetchTasks()
  ])
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}
</script>

<style scoped lang="scss">
.loading-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

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

.dashboard {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.chart-section {
  @media (max-width: 1024px) {
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
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

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;

  &--primary {
    background-color: #3b82f6;
    color: white;

    &:hover {
      background-color: #2563eb;
    }
  }
}
</style>
