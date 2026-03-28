<template>
  <tr class="project-row" @click="goToProject">
    <td class="project-row__cell" :style="{ width: widths.id + 'px' }">{{ project.id }}</td>
    <td class="project-row__cell" :style="{ width: widths.name + 'px' }">{{ project.name }}</td>
    <td class="project-row__cell" :style="{ width: widths.taskCount + 'px' }">{{ project.taskCount }}</td>
    <td class="project-row__cell" :style="{ width: widths.status + 'px' }">
      <span class="status-badge" :class="`status--${project.status.toLowerCase().replace(' ', '-')}`">
        {{ project.status }}
      </span>
    </td>
    <td class="project-row__cell" :style="{ width: widths.createdAt + 'px' }">{{ formattedDate }}</td>
    <td class="project-row__cell" :style="{ width: widths.actions + 'px' }">
      <button @click="startEdit" class="action-btn edit-btn" title="Редагувати">✏️</button>
      <button @click="confirmDelete" class="action-btn delete-btn" title="Видалити">🗑️</button>
    </td>
  </tr>
  
  <div v-if="showConfirm" class="modal-overlay">
    <div class="confirm-modal">
      <h3>Видалити проєкт?</h3>
      <p>Ви впевнені, що хочете видалити проєкт "{{ project.name }}"?</p>
      <p class="warning">⚠️ Всі задачі в цьому проєкті також будуть видалені!</p>
      <div class="modal-actions">
        <button @click="cancelDelete" class="cancel-btn">Скасувати</button>
        <button @click="deleteProject" class="confirm-delete-btn">Видалити</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../store/projects'
import { useTaskStore } from '../store/tasks'
import type { IProject } from '../mocks/projects'

const props = defineProps<{
  project: IProject
  widths: {
    id: number
    name: number
    taskCount: number
    status: number
    createdAt: number
    actions: number
  }
}>()

const emit = defineEmits<{
  edit: [project: IProject]
}>()

const router = useRouter()
const projectsStore = useProjectsStore()
const taskStore = useTaskStore()

const showConfirm = ref(false)

const formattedDate = computed(() => {
  const date = new Date(props.project.createdDate)
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.')
})

const goToProject = () => {
  router.push(`/project/${props.project.id}`)
}

const startEdit = (event: MouseEvent) => {
  event.stopPropagation()
  emit('edit', props.project)
}

const confirmDelete = (event: MouseEvent) => {
  event.stopPropagation()
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
  cursor: pointer;

  &:hover {
    background-color: #f9fafb;
  }

  &__cell {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
    
    &:nth-child(2) {
      color: #42b883;
      font-weight: 500;
    }
  }
  
  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
    margin-right: 0.5rem;
    
    &:last-child {
      margin-right: 0;
    }
    
    &:hover {
      background-color: rgba(59, 130, 246, 0.1);
    }
    
    &.delete-btn:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }
  }
}

.project-row:last-child .project-row__cell {
  border-bottom: none;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;

  &.status--planning {
    background-color: #fef3c7;
    color: #92400e;
  }

  &.status--in-progress {
    background-color: #dbeafe;
    color: #1e40af;
  }

  &.status--completed {
    background-color: #d1fae5;
    color: #065f46;
  }

  &.status--on-hold {
    background-color: #fee2e2;
    color: #991b1b;
  }
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
