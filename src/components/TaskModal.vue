<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditMode ? 'Редагувати задачу' : 'Створити задачу' }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="task-form">
        <div class="form-group">
          <label for="title">Назва задачі *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            :class="['form-input', { 'error': errors.title }]"
            placeholder="Введіть назву задачі"
            @blur="validateField('title')"
          />
          <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
        </div>
        
        <div class="form-group">
          <label for="assignee">Виконавець</label>
          <select
            id="assignee"
            v-model="formData.assignee"
            class="form-select"
          >
            <option value="">Не призначено</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="status">Статус *</label>
          <select
            id="status"
            v-model="formData.status"
            :class="['form-select', { 'error': errors.status }]"
            @blur="validateField('status')"
          >
            <option value="">Оберіть статус</option>
            <option value="todo">До виконання</option>
            <option value="in-progress">В роботі</option>
            <option value="done">Завершено</option>
          </select>
          <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
        </div>
        
        <div class="form-group">
          <label for="dueDate">Термін виконання *</label>
          <input
            id="dueDate"
            v-model="formData.dueDate"
            type="date"
            :class="['form-input', { 'error': errors.dueDate }]"
            @blur="validateField('dueDate')"
            @change="validateField('dueDate')"
          />
          <span v-if="errors.dueDate" class="error-message">{{ errors.dueDate }}</span>
        </div>
        
        <div class="form-actions">
          <button
            type="button"
            @click="closeModal"
            class="btn btn-secondary"
            :disabled="isLoading"
          >
            Скасувати
          </button>
          <button
            v-if="isEditMode"
            type="button"
            @click="handleDelete"
            class="btn btn-danger"
            :disabled="isLoading"
          >
            Видалити
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="hasErrors || isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Збереження...' : 'Зберегти' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useTaskStore } from '../store/tasks'
import type { Task } from '../store/tasks'
import { mockUsers } from '../mocks/users'
import { handleError } from '../utils/errorHandler'

interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  task?: Task
  projectId: number
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taskStore = useTaskStore()

const users = mockUsers

const isEditMode = computed(() => props.mode === 'edit')

const formData = ref({
  title: '',
  assignee: '' as string | number,
  status: 'todo' as Task['status'],
  dueDate: ''
})

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)

const hasErrors = computed(() => Object.keys(errors.value).some(key => errors.value[key]))

const originalDueDate = ref('')

const validateField = (field: string): void => {
  delete errors.value[field]

  switch (field) {
    case 'title':
      if (!formData.value.title.trim()) {
        errors.value.title = 'Назва задачі обов\'язкова'
      } else if (formData.value.title.trim().length < 3) {
        errors.value.title = 'Мінімальна довжина - 3 символи'
      } else if (formData.value.title.trim().length > 120) {
        errors.value.title = 'Максимальна довжина - 120 символів'
      }
      break
      
    case 'status':
      if (!formData.value.status) {
        errors.value.status = 'Статус обов\'язковий'
      }
      break
      
    case 'dueDate':
      if (!formData.value.dueDate) {
        errors.value.dueDate = 'Термін виконання обов\'язковий'
      } else {
        const selectedDate = new Date(formData.value.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
          errors.value.dueDate = 'Дата не може бути меншою за поточну'
        }
      }
      break
  }
}

const validateForm = (): boolean => {
  validateField('title')
  validateField('status')
  validateField('dueDate')
  
  return !hasErrors.value
}

const resetForm = (): void => {
  const today = new Date().toISOString().split('T')[0]
  formData.value = {
    title: '',
    assignee: '',
    status: 'todo',
    dueDate: today
  }
  errors.value = {}
}

const loadTaskData = (): void => {
  if (isEditMode.value && props.task) {
    formData.value = {
      title: props.task.title,
      assignee: props.task.assignee || '',
      status: props.task.status,
      dueDate: props.task.dueDate || ''
    }
    originalDueDate.value = props.task.dueDate || ''
  } else {
    resetForm()
    originalDueDate.value = ''
  }
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    if (isEditMode.value && props.task) {
      await taskStore.updateTask(props.task.id, {
        title: formData.value.title.trim(),
        assignee: formData.value.assignee ? Number(formData.value.assignee) : undefined,
        status: formData.value.status,
        dueDate: formData.value.dueDate || undefined
      })
    } else {
      await taskStore.addTask({
        projectId: props.projectId,
        title: formData.value.title.trim(),
        assignee: formData.value.assignee ? Number(formData.value.assignee) : undefined,
        status: formData.value.status,
        dueDate: formData.value.dueDate || undefined,
        description: '',
        priority: 'Medium'
      })
    }

    closeModal()
  } catch (error) {
    handleError(error, { message: 'Помилка при збереженні задачі' })
  } finally {
    isLoading.value = false
  }
}

const closeModal = (): void => {
  emit('close')
}

const handleDelete = async (): Promise<void> => {
  if (!isEditMode.value || !props.task) return
  
  const confirmed = confirm('Ви впевнені, що хочете видалити цю задачу?')
  if (!confirmed) return
  
  isLoading.value = true
  
  try {
    await taskStore.deleteTask(props.task.id)
    closeModal()
  } catch (error) {
    handleError(error, { message: 'Помилка при видаленні задачі' })
  } finally {
    isLoading.value = false
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      loadTaskData()
    })
  }
})

watch(() => props.task, () => {
  if (props.isOpen) {
    loadTaskData()
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
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
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  
  h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s;
    
    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

.task-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #42b883;
    box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    background-color: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
    
    &::placeholder {
      color: #9ca3af;
    }
  }
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
}

.field-hint {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  
  &:hover:not(:disabled) {
    background: #e5e7eb;
  }
}

.btn-primary {
  background: #42b883;
  color: white;
  
  &:hover:not(:disabled) {
    background: #369870;
  }
}

.btn-danger {
  background: #ef4444;
  color: white;
  
  &:hover:not(:disabled) {
    background: #dc2626;
  }
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .modal-content {
    margin: 0;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
