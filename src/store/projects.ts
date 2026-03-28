import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, type IProject, type ITask, type CreateProjectRequest } from '../services/api'
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

  const initializeFromStorage = (): boolean => persistence.initialize()

  const saveToStorage = (): void => persistence.save()

  initializeFromStorage()

  const seedData = (): void => {
    const hasSeeded = localStorageHelper.get<boolean>(LS_KEYS.HAS_SEEDED_PROJECTS)
    if (!hasSeeded && projects.value.length === 0) {
      projects.value = [...mockProjects]
      saveToStorage()
      localStorageHelper.set(LS_KEYS.HAS_SEEDED_PROJECTS, true)
    }
  }
  seedData()

  const getAllProjects = computed(() => projects.value)
  
  const getProjectById = computed((): ((id: number) => IProject | undefined) => {
    return (id: number) => projects.value.find(project => project.id === id)
  })

  const recalculateTaskCounts = (tasks: Array<Pick<ITask, 'projectId'>>): void => {
    const taskCountsByProjectId = tasks.reduce((acc, task) => {
      acc.set(task.projectId, (acc.get(task.projectId) || 0) + 1)
      return acc
    }, new Map<number, number>())

    let hasChanges = false
    projects.value = projects.value.map((project) => {
      const nextTaskCount = taskCountsByProjectId.get(project.id) || 0
      if (project.taskCount === nextTaskCount) {
        return project
      }

      hasChanges = true
      return { ...project, taskCount: nextTaskCount }
    })

    if (hasChanges) {
      saveToStorage()
    }
  }

  const fetchProjects = async (): Promise<void> => {
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

  const addProject = async (projectData: CreateProjectRequest): Promise<IProject> => {
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

  const deleteProject = async (projectId: number): Promise<boolean> => {
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
      toast.error('Ошибка при удалении проекта')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const updateProject = async (projectId: number, projectData: Partial<CreateProjectRequest>): Promise<IProject | null> => {
    const appStore = useAppStore()
    appStore.setLoading(true)
    try {
      const response = await api.updateProject(projectId, projectData)
      if (response.data) {
        const index = projects.value.findIndex(project => project.id === projectId)
        if (index > -1) {
          projects.value[index] = response.data
          saveToStorage()
        }
        toast.success('Проект оновлено')
        return response.data
      }
      return null
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
    updateProject,
    deleteProject,
    recalculateTaskCounts,
    initializeFromStorage,
    saveToStorage
  }
})
