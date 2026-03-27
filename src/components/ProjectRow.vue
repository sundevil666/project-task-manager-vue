<template>
  <tr class="project-row">
    <td class="project-row__cell">{{ project.id }}</td>
    <td class="project-row__cell"><router-link :to="`/project/${project.id}`">{{ project.name }}</router-link></td>
    <td class="project-row__cell">{{ project.taskCount }}</td>
    <td class="project-row__cell">
      <button @click="confirmDelete" class="delete-btn">🗑️</button>
    </td>
  </tr>
  
  <div v-if="showConfirm" class="modal-overlay">
    <div class="confirm-modal">
      <h3>Удалить проект?</h3>
      <p>Вы уверены, что хотите удалить проект "{{ project.name }}"?</p>
      <p class="warning">⚠️ Все задачи в этом проекте также будут удалены!</p>
      <div class="modal-actions">
        <button @click="cancelDelete" class="cancel-btn">Отмена</button>
        <button @click="deleteProject" class="confirm-delete-btn">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../store/projects'
import { useTaskStore } from '../store/tasks'
import type { IProject } from '../types'

const props = defineProps<{
  project: IProject
}>()

const router = useRouter()
const projectsStore = useProjectsStore()
const taskStore = useTaskStore()

const showConfirm = ref(false)

const confirmDelete = () => {
  showConfirm.value = true
}

const cancelDelete = () => {
  showConfirm.value = false
}

const deleteProject = async () => {
  try {
    await taskStore.deleteTasksByProjectId(props.project.id)
    
    await projectsStore.deleteProject(props.project.id)
    
    showConfirm.value = false
  } catch (error) {
    console.log(error)
  }
}
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
  
  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }
  }
}

.project-row:last-child .project-row__cell {
  border-bottom: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 400px;
  width: 90%;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
  }
  
  p {
    margin: 0.5rem 0;
    color: #6b7280;
    
    &.warning {
      color: #ef4444;
      font-weight: 500;
    }
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
  }
  
  .cancel-btn {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    
    &:hover {
      background: #e5e7eb;
    }
  }
  
  .confirm-delete-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    
    &:hover {
      background: #dc2626;
    }
  }
}
</style>
