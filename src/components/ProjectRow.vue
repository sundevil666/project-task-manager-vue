<template>
  <tr class="project-row">
    <td class="project-row__cell">{{ project.id }}</td>
    <td class="project-row__cell"><router-link :to="`/project/${project.id}`">{{ project.name }}</router-link></td>
    <td class="project-row__cell">{{ project.taskCount }}</td>
  </tr>
</template>

<script setup lang="ts">
import type { IProject } from '../types'

defineProps<{
  project: IProject
}>()
</script>

<style scoped lang="scss">
.project-row {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }

  &__cell {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
    
    a {
      color: #42b883;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.project-row:last-child .project-row__cell {
  border-bottom: none;
}
</style>
