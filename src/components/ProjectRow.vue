<template>
  <tr class="project-row">
    <td class="project-row__cell">{{ project.id }}</td>
    <td class="project-row__cell">{{ project.name }}</td>
    <td class="project-row__cell">{{ project.taskCount }}</td>
  </tr>
</template>

<script setup lang="ts">
interface Project {
  id: number
  name: string
  description: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
  createdDate: string
  taskCount: number
  tasks?: any[]
}

defineProps<{
  project: Project
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
  }
}

.project-row:last-child .project-row__cell {
  border-bottom: none;
}
</style>
