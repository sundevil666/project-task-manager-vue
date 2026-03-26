<template>
  <div class="project-detail">
    <div class="header">
      <button @click="goBack" class="back-button">← Back to Projects</button>
      <h1>{{ project?.name }}</h1>
    </div>
    
    <div v-if="project" class="project-content">
      <div class="project-info">
        <h2>Project Information</h2>
        <p><strong>Description:</strong> {{ project.description }}</p>
        <p><strong>Status:</strong> <span class="status">{{ project.status }}</span></p>
        <p><strong>Created:</strong> {{ project.createdDate }}</p>
      </div>
      
      <div class="tasks-section">
        <h2>Tasks</h2>
        <div class="tasks-list">
          <div v-for="task in project.tasks" :key="task.id" class="task-item">
            <h4>{{ task.title }}</h4>
            <p>{{ task.description }}</p>
            <span class="task-status">{{ task.status }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <h2>Project not found</h2>
      <p>The project you're looking for doesn't exist.</p>
      <button @click="goBack" class="back-button">Go back to projects</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

interface Task {
  id: number
  title: string
  description: string
  status: string
}

interface Project {
  id: number
  name: string
  description: string
  status: string
  createdDate: string
  tasks: Task[]
}

const projectsData: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'In Progress',
    createdDate: '2024-01-15',
    tasks: [
      { id: 1, title: 'Design mockups', description: 'Create initial design concepts', status: 'Completed' },
      { id: 2, title: 'Frontend development', description: 'Implement responsive design', status: 'In Progress' },
      { id: 3, title: 'Content migration', description: 'Migrate existing content', status: 'Pending' }
    ]
  },
  {
    id: 2,
    name: 'Mobile App',
    description: 'Native iOS and Android app development',
    status: 'Planning',
    createdDate: '2024-02-01',
    tasks: [
      { id: 4, title: 'Requirements gathering', description: 'Define app requirements', status: 'In Progress' },
      { id: 5, title: 'UI/UX design', description: 'Design app interface', status: 'Pending' }
    ]
  },
  {
    id: 3,
    name: 'API Integration',
    description: 'Third-party API integration project',
    status: 'Completed',
    createdDate: '2024-01-10',
    tasks: [
      { id: 6, title: 'API research', description: 'Research available APIs', status: 'Completed' },
      { id: 7, title: 'Integration setup', description: 'Set up API connections', status: 'Completed' }
    ]
  }
]

const project = computed(() => {
  const projectId = Number(route.params.id)
  return projectsData.find(p => p.id === projectId)
})

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.project-detail {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  color: #42b883;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: rgba(66, 184, 131, 0.1);
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.project-content {
  display: grid;
  gap: 2rem;
}

.project-info, .tasks-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.project-info h2, .tasks-section h2 {
  margin-top: 0;
  color: #2c3e50;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: #42b883;
  color: white;
}

.tasks-list {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.task-item {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.task-item h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.task-item p {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.task-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #e3f2fd;
  color: #1976d2;
}

.not-found {
  text-align: center;
  padding: 3rem;
}

.not-found h2 {
  color: #e74c3c;
}
</style>
