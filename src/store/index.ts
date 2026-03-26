import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const hasError = computed(() => error.value !== null)
  
  // Actions
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    // State
    isLoading,
    error,
    // Getters
    hasError,
    // Actions
    setLoading,
    setError,
    clearError
  }
})

export { useProjectsStore } from './projects'
