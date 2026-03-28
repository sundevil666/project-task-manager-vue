import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectsStore } from '../store/projects'
import * as apiModule from '../services/api'
import type { AxiosResponse } from 'axios'

vi.mock('../services/api', () => ({
  api: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
  }
}))

vi.mock('vue-toastification', () => ({
  useToast: (): { success: Mock; error: Mock } => ({
    success: vi.fn(),
    error: vi.fn(),
  })
}))

vi.mock('../store/index', () => ({
  useAppStore: (): { setLoading: Mock; setError: Mock; clearError: Mock } => ({
    setLoading: vi.fn(),
    setError: vi.fn(),
    clearError: vi.fn(),
  })
}))

describe('useProjectsStore', () => {
  let store: ReturnType<typeof useProjectsStore>

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('has_seeded_projects', 'true')
    localStorage.setItem('has_seeded_tasks', 'true')
    setActivePinia(createPinia())
    store = useProjectsStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('state', () => {
    it('should have empty projects array initially', () => {
      expect(store.projects).toEqual([])
    })
  })

  describe('fetchProjects', () => {
    it('should fetch projects from API and update state', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1', description: 'Desc 1', status: 'Planning' as const, createdDate: '2024-01-01', taskCount: 0 },
        { id: 2, name: 'Project 2', description: 'Desc 2', status: 'In Progress' as const, createdDate: '2024-01-02', taskCount: 0 }
      ]
      vi.mocked(apiModule.api.getProjects).mockResolvedValue({ data: mockProjects, status: 200, statusText: 'OK', headers: {}, config: {} } as unknown as AxiosResponse)

      await store.fetchProjects()

      expect(store.projects).toEqual(mockProjects)
      expect(apiModule.api.getProjects).toHaveBeenCalledTimes(1)
    })

    it('should load from localStorage if data exists', async () => {
      const storedProjects = [{ id: 1, name: 'Stored Project', description: 'Desc', status: 'Planning' as const, createdDate: '2024-01-01', taskCount: 0 }]
      localStorage.setItem('projects', JSON.stringify(storedProjects))

      await store.fetchProjects()

      expect(store.projects).toEqual(storedProjects)
      expect(apiModule.api.getProjects).not.toHaveBeenCalled()
    })

    it('should throw error when API fails', async () => {
      vi.mocked(apiModule.api.getProjects).mockRejectedValue(new Error('API Error'))

      await expect(store.fetchProjects()).rejects.toThrow('API Error')
    })
  })

  describe('addProject', () => {
    it('should add project to state and save to localStorage', async () => {
      const newProject = { id: 3, name: 'New Project', description: 'New Desc', status: 'Planning' as const, createdDate: '2024-01-03', taskCount: 0 }
      vi.mocked(apiModule.api.createProject).mockResolvedValue({ data: newProject, status: 200, statusText: 'OK', headers: {}, config: {} } as unknown as AxiosResponse)

      const result = await store.addProject({ name: 'New Project', description: 'New Desc' })

      expect(store.projects).toContainEqual(newProject)
      expect(result).toEqual(newProject)
      expect(apiModule.api.createProject).toHaveBeenCalledWith({ name: 'New Project', description: 'New Desc' })
      
      const stored = JSON.parse(localStorage.getItem('projects') || '[]')
      expect(stored).toContainEqual(newProject)
    })

    it('should throw error when API fails', async () => {
      vi.mocked(apiModule.api.createProject).mockRejectedValue(new Error('Create failed'))

      await expect(store.addProject({ name: 'Test', description: 'Test' })).rejects.toThrow('Create failed')
    })
  })

  describe('deleteProject', () => {
    it('should remove project from state and localStorage', async () => {
      const projects = [
        { id: 1, name: 'Project 1', description: 'Desc 1', status: 'Planning' as const, createdDate: '2024-01-01', taskCount: 0 },
        { id: 2, name: 'Project 2', description: 'Desc 2', status: 'In Progress' as const, createdDate: '2024-01-02', taskCount: 0 }
      ]
      store.projects = [...projects]
      store.saveToStorage()
      vi.mocked(apiModule.api.deleteProject).mockResolvedValue({ data: true, status: 200, statusText: 'OK', headers: {}, config: {} } as unknown as AxiosResponse)

      await store.deleteProject(1)

      expect(store.projects).toHaveLength(1)
      expect(store.projects[0].id).toBe(2)
      
      const stored = JSON.parse(localStorage.getItem('projects') || '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].id).toBe(2)
    })

    it('should throw error when API fails', async () => {
      vi.mocked(apiModule.api.deleteProject).mockRejectedValue(new Error('Delete failed'))

      await expect(store.deleteProject(1)).rejects.toThrow('Delete failed')
    })
  })

  describe('getters', () => {
    it('getAllProjects should return all projects', () => {
      store.projects = [
        { id: 1, name: 'Project 1', description: 'Desc', status: 'Planning' as const, createdDate: '2024-01-01', taskCount: 0 }
      ]

      expect(store.getAllProjects).toEqual(store.projects)
    })

    it('getProjectById should return correct project', () => {
      store.projects = [
        { id: 1, name: 'Project 1', description: 'Desc 1', status: 'Planning' as const, createdDate: '2024-01-01', taskCount: 0 },
        { id: 2, name: 'Project 2', description: 'Desc 2', status: 'In Progress' as const, createdDate: '2024-01-02', taskCount: 0 }
      ]

      const project = store.getProjectById(2)
      expect(project?.name).toBe('Project 2')
    })

    it('getProjectById should return undefined for non-existent id', () => {
      store.projects = [{ id: 1, name: 'Project 1', description: 'Desc', status: 'Planning' as const, createdDate: '2024-01-01', taskCount: 0 }]

      expect(store.getProjectById(999)).toBeUndefined()
    })
  })
})
