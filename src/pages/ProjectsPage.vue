<template>
  <div class="projects-page">
    <h1>Projects</h1>
    <div class="projects-list">
      <div 
        v-for="project in projects" 
        :key="project.id"
        class="project-card"
        @click="goToProject(project.id)"
      >
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Project {
  id: number
  name: string
  description: string
}

const projects = ref<Project[]>([
  { id: 1, name: 'Website Redesign', description: 'Complete overhaul of company website' },
  { id: 2, name: 'Mobile App', description: 'Native iOS and Android app development' },
  { id: 3, name: 'API Integration', description: 'Third-party API integration project' }
])

const goToProject = (id: number) => {
  router.push(`/project/${id}`)
}
</script>

<style scoped>
.projects-page {
  padding: 2rem;
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.project-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-card:hover {
  border-color: #42b883;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.15);
}

.project-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.project-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}
</style>
