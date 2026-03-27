import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, type IProject, type CreateProjectRequest } from '../services/api'
import { useAppStore } from './index'
import { createPersistence, LS_KEYS, localStorageHelper } from '../utils/localStorage'
import { useToast } from 'vue-toastification'
import { mockProjects } from '../mocks/projects'

export const useProjectsStore = defineStore('projects', () => {
  const toast = useToast()
  
  const projects = ref<IProject[]>([])

  const persistence = createPersistence(
    LS_KEYS.PROJECTS,
    () => projects.value,
    (state) => { projects.value = state }
  )

  const initializeFromStorage = () => persistence.initialize()

  const saveToStorage = () => persistence.save()

  initializeFromStorage()

  const seedData = () => {
    const hasSeeded = localStorageHelper.get<boolean>(LS_KEYS.HAS_SEEDED_PROJECTS)
    if (!hasSeeded && projects.value.length === 0) {
      projects.value = [...mockProjects]
      saveToStorage()
      localStorageHelper.set(LS_KEYS.HAS_SEEDED_PROJECTS, true)
    }
  }
  seedData()

  const getAllProjects = computed(() => projects.value)
  
  const getProjectById = computed(() => {
    return (id: number) => projects.value.find(project => project.id === id)
  })

  const fetchProjects = async () => {
    const appStore = useAppStore()
    
    const hasStoredData = initializeFromStorage()
    if (hasStoredData) {
      return
    }
    
    appStore.setLoading(true)
    try {
      const response = await api.getProjects()
      projects.value = response.data
      saveToStorage()
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
    } finally {
      appStore.setLoading(false)
    }
  }

  return {
    projects,
    getAllProjects,
    getProjectById,
    fetchProjects,
    addProject,
    deleteProject,
    initializeFromStorage,
    saveToStorage
  }
})
