import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore, type Task } from '../store/tasks'
import * as apiModule from '../services/api'
import type { AxiosResponse } from 'axios'

vi.mock('../services/api', () => ({
  api: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }
}))

vi.mock('vue-toastification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  })
}))

describe('useTaskStore', () => {
  let store: ReturnType<typeof useTaskStore>

  const mockTask1: Task = {
    id: 1,
    projectId: 1,
    title: 'Task 1',
    description: 'Description 1',
    status: 'todo',
    priority: 'High',
    assignee: 1,
    dueDate: '2024-01-01',
    createdDate: '2024-01-01',
    order: 0
  }

  const mockTask2: Task = {
    id: 2,
    projectId: 1,
    title: 'Task 2',
    description: 'Description 2',
    status: 'in-progress',
    priority: 'Medium',
    assignee: 2,
    dueDate: '2024-01-02',
    createdDate: '2024-01-02',
    order: 1
  }

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('has_seeded_projects', 'true')
    localStorage.setItem('has_seeded_tasks', 'true')
    setActivePinia(createPinia())
    store = useTaskStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('state', () => {
    it('should have empty tasks array initially', () => {
      expect(store.tasks).toEqual([])
    })

    it('should have loading false initially', () => {
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchTasks', () => {
    it('should fetch tasks from API and update state', async () => {
      const apiTasks = [
        { ...mockTask1, status: 'Pending' as const },
        { ...mockTask2, status: 'In Progress' as const }
      ]
      vi.mocked(apiModule.api.getTasks).mockResolvedValue({ data: apiTasks, status: 200, statusText: 'OK', headers: {}, config: {} } as unknown as AxiosResponse)

      await store.fetchTasks()

      expect(store.tasks).toHaveLength(2)
      expect(store.tasks[0].status).toBe('todo')
      expect(store.tasks[1].status).toBe('in-progress')
      expect(apiModule.api.getTasks).toHaveBeenCalledTimes(1)
    })

    it('should load from localStorage if data exists', async () => {
      const storedTasks = [mockTask1]
      localStorage.setItem('tasks', JSON.stringify(storedTasks))

      await store.fetchTasks()

      expect(store.tasks).toEqual(storedTasks)
      expect(apiModule.api.getTasks).not.toHaveBeenCalled()
    })

    it('should fetch tasks for specific project', async () => {
      const apiTasks = [{ ...mockTask1, status: 'Pending' as const }]
      vi.mocked(apiModule.api.getTasks).mockResolvedValue({ data: apiTasks, status: 200, statusText: 'OK', headers: {}, config: {} } as unknown as AxiosResponse)

      await store.fetchTasks(1)

      expect(apiModule.api.getTasks).toHaveBeenCalledWith(1)
    })

    it('should throw error when API fails', async () => {
      vi.mocked(apiModule.api.getTasks).mockRejectedValue(new Error('API Error'))

      await expect(store.fetchTasks()).rejects.toThrow('API Error')
    })
  })

  describe('addTask', () => {
    it('should add task to state and save to localStorage', async () => {
      const newTask = { ...mockTask1, id: 3, order: 0 }
      const taskData = {
        projectId: 1,
        title: 'Task 1',
        description: 'Description 1',
        priority: 'High' as const,
        assignee: 1,
        dueDate: '2024-01-01',
        status: 'todo' as const
      }
      
      vi.mocked(apiModule.api.createTask).mockResolvedValue({ 
        data: { ...newTask, status: 'Pending', order: 0 }, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: {} 
      } as unknown as AxiosResponse)

      const result = await store.addTask(taskData)

      expect(store.tasks).toContainEqual(expect.objectContaining({ title: 'Task 1' }))
      expect(result!.title).toBe('Task 1')
      
      const stored = JSON.parse(localStorage.getItem('tasks') || '[]')
      expect(stored).toHaveLength(1)
    })

    it('should increment order for tasks in same project', async () => {
      store.tasks = [mockTask1]
      store.saveToStorage()
      
      const taskData = {
        projectId: 1,
        title: 'New Task',
        description: 'New Desc',
        priority: 'Low' as const,
        assignee: 3,
        dueDate: '2024-01-03',
        status: 'todo' as const
      }
      
      vi.mocked(apiModule.api.createTask).mockResolvedValue({ 
        data: { 
          id: 3, 
          projectId: 1, 
          title: 'New Task',
          description: 'New Desc',
          priority: 'Low' as const,
          assignee: 3,
          dueDate: '2024-01-03',
          createdDate: '2024-01-03',
          status: 'Pending' as const,
          order: 0
        }, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: {} 
      } as unknown as AxiosResponse)

      const result = await store.addTask(taskData)

      expect(result!.order).toBe(1)
    })

    it('should throw error when API fails', async () => {
      vi.mocked(apiModule.api.createTask).mockRejectedValue(new Error('Create failed'))

      await expect(store.addTask({
        projectId: 1,
        title: 'Test',
        description: 'Test',
        priority: 'Low' as const,
        assignee: 999,
        dueDate: '2024-01-01',
        status: 'todo' as const
      })).rejects.toThrow('Create failed')
    })
  })

  describe('updateTask', () => {
    it('should update task in state', async () => {
      store.tasks = [{ ...mockTask1 }]
      
      vi.mocked(apiModule.api.updateTask).mockResolvedValue({ 
        data: { ...mockTask1, title: 'Updated Title', status: 'Completed' as const }, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: {} 
      } as unknown as AxiosResponse)

      const result = await store.updateTask(1, { title: 'Updated Title', status: 'done' })

      expect(store.tasks[0].title).toBe('Updated Title')
      expect(store.tasks[0].status).toBe('done')
      expect(result?.title).toBe('Updated Title')
    })

    it('should preserve order when updating', async () => {
      store.tasks = [{ ...mockTask1, order: 5 }]
      
      vi.mocked(apiModule.api.updateTask).mockResolvedValue({ 
        data: { ...mockTask1, title: 'Updated', status: 'Completed' as const }, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: {} 
      } as unknown as AxiosResponse)

      await store.updateTask(1, { title: 'Updated' })

      expect(store.tasks[0].order).toBe(5)
    })

    it('should return null for non-existent task', async () => {
      vi.mocked(apiModule.api.updateTask).mockResolvedValue({ 
        data: null, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: {} 
      } as unknown as AxiosResponse)

      const result = await store.updateTask(999, { title: 'Updated' })

      expect(result).toBeNull()
    })

    it('should throw error when API fails', async () => {
      vi.mocked(apiModule.api.updateTask).mockRejectedValue(new Error('Update failed'))

      await expect(store.updateTask(1, { title: 'Updated' })).rejects.toThrow('Update failed')
    })
  })

  describe('deleteTask', () => {
    it('should remove task from state', async () => {
      store.tasks = [mockTask1, mockTask2]
      vi.mocked(apiModule.api.deleteTask).mockResolvedValue({ data: true, status: 200, statusText: 'OK', headers: {}, config: {} } as unknown as AxiosResponse)

      await store.deleteTask(1)

      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0].id).toBe(2)
    })

    it('should throw error when API fails', async () => {
      vi.mocked(apiModule.api.deleteTask).mockRejectedValue(new Error('Delete failed'))

      await expect(store.deleteTask(1)).rejects.toThrow('Delete failed')
    })
  })

  describe('getters', () => {
    it('getTasksByProjectId should return tasks for specific project', () => {
      store.tasks = [
        { ...mockTask1, projectId: 1 },
        { ...mockTask2, projectId: 2 },
        { ...mockTask1, id: 3, projectId: 1 }
      ]

      const result = store.getTasksByProjectId(1)

      expect(result).toHaveLength(2)
      expect(result.every(t => t.projectId === 1)).toBe(true)
    })

    it('getTasksByStatus should group tasks by status', () => {
      store.tasks = [
        { ...mockTask1, status: 'todo' as const },
        { ...mockTask2, status: 'in-progress' as const },
        { ...mockTask1, id: 3, status: 'done' as const }
      ]

      const result = store.getTasksByStatus

      expect(result['todo']).toHaveLength(1)
      expect(result['in-progress']).toHaveLength(1)
      expect(result['done']).toHaveLength(1)
    })

    it('kanbanColumns should return columns in correct order', () => {
      store.tasks = [mockTask1, mockTask2]

      const result = store.kanbanColumns

      expect(result).toHaveLength(3)
      expect(result[0].status).toBe('todo')
      expect(result[1].status).toBe('in-progress')
      expect(result[2].status).toBe('done')
    })
  })

  describe('filters', () => {
    it('setFilters should update filters', () => {
      store.setFilters({ status: 'todo', assignee: 1 })

      expect(store.filters.status).toBe('todo')
      expect(store.filters.assignee).toBe(1)
    })

    it('clearFilters should reset filters', () => {
      store.setFilters({ status: 'todo' })
      store.clearFilters()

      expect(store.filters).toEqual({})
    })

    it('filteredTasks should apply status filter', () => {
      store.tasks = [
        { ...mockTask1, status: 'todo' as const },
        { ...mockTask2, status: 'in-progress' as const }
      ]
      store.setFilters({ status: 'todo' })

      const result = store.filteredTasks

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('todo')
    })
  })
})
