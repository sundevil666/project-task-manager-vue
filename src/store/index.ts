import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const hasError = computed(() => error.value !== null)
  
  const setLoading = (loading: boolean): void => {
    isLoading.value = loading
  }
  
  const setError = (errorMessage: string | null): void => {
    error.value = errorMessage
  }
  
  const clearError = (): void => {
    error.value = null
  }
  
  return {
    isLoading,
    error,
    hasError,
    setLoading,
    setError,
    clearError
  }
})

export { useProjectsStore } from './projects'
