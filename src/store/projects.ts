import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, type Project, type CreateProjectRequest } from '../services/api'
import { useAppStore } from './index'

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])

  // Getters
  const getAllProjects = computed(() => projects.value)
  
  const getProjectById = computed(() => {
    return (id: number) => projects.value.find(project => project.id === id)
  })

  // Actions
  const fetchProjects = async () => {
    const appStore = useAppStore()
    appStore.setLoading(true)
    try {
      const response = await api.getProjects()
      projects.value = response.data
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
      return response.data
    } catch (error) {
      console.error('Error creating project:', error)
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
    addProject
  }
})
