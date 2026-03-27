import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, type IProject, type CreateProjectRequest } from '../services/api'
import { useAppStore } from './index'
import { createPersistence, LS_KEYS } from '../utils/localStorage'
import { useToast } from 'vue-toastification'

export const useProjectsStore = defineStore('projects', () => {
  const toast = useToast()
  
  // State
  const projects = ref<IProject[]>([])

  // Create persistence utility
  const persistence = createPersistence(
    LS_KEYS.PROJECTS,
    () => projects.value,
    (state) => { projects.value = state }
  )

  // Initialize from LocalStorage
  const initializeFromStorage = () => persistence.initialize()

  // Save to LocalStorage
  const saveToStorage = () => persistence.save()

  // Initialize on store creation
  initializeFromStorage()

  // Getters
  const getAllProjects = computed(() => projects.value)
  
  const getProjectById = computed(() => {
    return (id: number) => projects.value.find(project => project.id === id)
  })

  // Actions
  const fetchProjects = async () => {
    const appStore = useAppStore()
    
    // Try to load from LocalStorage first
    const hasStoredData = initializeFromStorage()
    if (hasStoredData) {
      return
    }
    
    appStore.setLoading(true)
    try {
      const response = await api.getProjects()
      projects.value = response.data
      saveToStorage()
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const addProject = async (projectData: CreateProjectRequest) => {
    const appStore = useAppStore()
    appStore.setLoading(true)
    try {
      const response = await api.createProject(projectData)
      projects.value.push(response.data)
      saveToStorage()
      toast.success('Проект успешно добавлен')
      return response.data
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Ошибка при создании проекта')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const deleteProject = async (projectId: number) => {
    const appStore = useAppStore()
    appStore.setLoading(true)
    try {
      await api.deleteProject(projectId)
      const index = projects.value.findIndex(project => project.id === projectId)
      if (index > -1) {
        projects.value.splice(index, 1)
        saveToStorage()
      }
      toast.success('Проект успешно удален')
      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Ошибка при удалении проекта')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  return {
    // State
    projects,
    
    // Getters
    getAllProjects,
    getProjectById,
    
    // Actions
    fetchProjects,
    addProject,
    deleteProject,
    
    // Internal methods (for hydration)
    initializeFromStorage,
    saveToStorage
  }
})
