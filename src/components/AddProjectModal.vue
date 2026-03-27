<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal__header">
        <h2 class="modal__title">Додати проєкт</h2>
        <button class="modal__close" @click="closeModal">&times;</button>
      </div>
      
      <form class="modal__form">
        <div class="form-group">
          <label for="project-name" class="form-label">Назва проєкту</label>
          <input
            id="project-name"
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.name }"
            placeholder="Введіть назву проєкту"
          />
          <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
        </div>
        
        <div class="form-group">
          <label for="project-description" class="form-label">Опис проєкту</label>
          <textarea
            id="project-description"
            v-model="formData.description"
            class="form-textarea"
            placeholder="Введіть опис проєкту"
            rows="4"
          />
        </div>
        
        <div class="modal__actions">
          <button type="button" class="btn btn--secondary" @click="closeModal">
            Скасувати
          </button>
          <button 
            type="button" 
            class="btn btn--primary" 
            @click="saveProject"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Збереження...</span>
            <span v-else>Зберегти</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useProjectsStore } from '../store/projects'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const projectsStore = useProjectsStore()

const formData = reactive({
  name: '',
  description: ''
})

const errors = reactive({
  name: ''
})

const isSubmitting = ref(false)

const validateForm = (): boolean => {
  errors.name = ''
  
  if (!formData.name.trim()) {
    errors.name = 'Назва проєкту обов\'язкова для заповнення'
    return false
  }
  
  return true
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
  errors.name = ''
}

const saveProject = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    await projectsStore.addProject({
      name: formData.name.trim(),
      description: formData.description.trim()
    })
    
    closeModal()
  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  &__title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  &__close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    line-height: 1;

    &:hover {
      color: #1f2937;
    }
  }

  &__form {
    padding: 1.5rem;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }

  &--error {
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--primary {
    background-color: #3b82f6;
    color: white;

    &:hover:not(:disabled) {
      background-color: #2563eb;
    }
  }

  &--secondary {
    background-color: #f3f4f6;
    color: #374151;

    &:hover:not(:disabled) {
      background-color: #e5e7eb;
    }
  }
}

@media (max-width: 640px) {
  .modal {
    width: 95%;
    margin: 1rem;
  }

  .modal__actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
