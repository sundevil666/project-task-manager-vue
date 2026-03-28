import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { api } from '../services/api'
import type { ITask as ApiTask, CreateTaskRequest } from '../services/api'
import { createPersistence, LS_KEYS, localStorageHelper } from '../utils/localStorage'
import { useToast } from 'vue-toastification'
import { mockTasks } from '../mocks/tasks'
import { getUserNameById } from '../mocks/users'

export interface Task extends Omit<ApiTask, 'status'> {
  status: 'todo' | 'in-progress' | 'done'
  order: number
}

export interface TaskFilters {
  status?: Task['status']
  assignee?: number | null | 'all'
}

export interface TaskSort {
  column: 'status' | 'dueDate' | 'title' | 'assignee' | 'order' | 'id'
  direction: 'asc' | 'desc'
}

export interface TableSettings {
  sort: TaskSort
  filters: TaskFilters
  columnWidths: {
    id: number
    title: number
    assignee: number
    status: number
    dueDate: number
  }
}

export interface KanbanColumn {
  status: Task['status']
  tasks: Task[]
}

export const useTaskStore = defineStore('tasks', () => {
  const toast = useToast()
  
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const filters = ref<TaskFilters>({})
  const sort = ref<TaskSort>({ column: 'status', direction: 'asc' })

  const persistence = createPersistence(
    LS_KEYS.TASKS,
    () => tasks.value,
    (state) => { tasks.value = state }
  )

  const mapApiStatusToTaskStatus = (apiStatus: string): Task['status'] => {
    switch (apiStatus) {
      case 'Pending': return 'todo'
      case 'In Progress': return 'in-progress'
      case 'Completed': return 'done'
      case 'Blocked': return 'todo'
      default: return 'todo'
    }
  }

  const mapTaskStatusToApiStatus = (taskStatus: Task['status']): string => {
    switch (taskStatus) {
      case 'todo': return 'Pending'
      case 'in-progress': return 'In Progress'
      case 'done': return 'Completed'
      default: return 'Pending'
    }
  }

  const initializeFromStorage = () => {
    const result = persistence.initialize()
    return result
  }

  const saveToStorage = () => persistence.save()

  initializeFromStorage()

  const seedData = () => {
    const hasSeeded = localStorageHelper.get<boolean>(LS_KEYS.HAS_SEEDED_TASKS)
    if (!hasSeeded && tasks.value.length === 0) {
      const seededTasks = mockTasks.map(task => ({
        ...task,
        status: mapApiStatusToTaskStatus(task.status),
        order: task.order || 0
      }))
      tasks.value = seededTasks
      saveToStorage()
      localStorageHelper.set(LS_KEYS.HAS_SEEDED_TASKS, true)
    }
  }
  seedData()

  const getTasksByProjectId = computed(() => {
    return (projectId: number) => {
      return tasks.value
        .filter(task => task.projectId === projectId)
        .sort((a, b) => a.order - b.order)
    }
  })

  const filteredTasks = computed(() => {
    let filtered = [...tasks.value]

    if (filters.value.status) {
      filtered = filtered.filter(task => task.status === filters.value.status)
    }

    if (filters.value.assignee !== undefined && filters.value.assignee !== 'all') {
      filtered = filtered.filter(task => task.assignee === filters.value.assignee)
    }

    return filtered.sort((a, b) => a.order - b.order)
  })

  const getFilteredAndSortedTasks = computed(() => {
    return (projectId: number) => {
      let filtered = tasks.value.filter(task => task.projectId === projectId)

      if (filters.value.status) {
        filtered = filtered.filter(task => task.status === filters.value.status)
      }

      if (filters.value.assignee !== undefined && filters.value.assignee !== 'all') {
        filtered = filtered.filter(task => task.assignee === filters.value.assignee)
      }

      filtered.sort((a, b) => {
        const { column, direction } = sort.value
        
        if (column === 'order') {
          return a.order - b.order
        }
        
        let aValue: any
        let bValue: any

        switch (column) {
          case 'id':
            aValue = a.id
            bValue = b.id
            break
          case 'status':
            aValue = a.status
            bValue = b.status
            break
          case 'dueDate':
            aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
            bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
            break
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          case 'assignee':
            aValue = getUserNameById(a.assignee).toLowerCase()
            bValue = getUserNameById(b.assignee).toLowerCase()
            break
          default:
            return a.order - b.order
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1
        if (aValue > bValue) return direction === 'asc' ? 1 : -1
        return 0
      })

      return filtered
    }
  })

  const getTasksByStatus = computed(() => {
    const statusGroups: Record<Task['status'], Task[]> = {
      'todo': [],
      'in-progress': [],
      'done': []
    }

    tasks.value.forEach(task => {
      statusGroups[task.status].push(task)
    })

    Object.keys(statusGroups).forEach(status => {
      statusGroups[status as Task['status']].sort((a, b) => a.order - b.order)
    })

    return statusGroups
  })

  const kanbanColumns = computed((): KanbanColumn[] => {
    const statusGroups = getTasksByStatus.value
    return [
      { status: 'todo', tasks: statusGroups['todo'] },
      { status: 'in-progress', tasks: statusGroups['in-progress'] },
      { status: 'done', tasks: statusGroups['done'] }
    ]
  })

  const fetchTasks = async (projectId?: number) => {
    loading.value = true
    
    const hasStoredData = initializeFromStorage()
    if (hasStoredData && projectId === undefined) {
      loading.value = false
      return
    }
    
    try {
      const response = await api.getTasks(projectId)
      const fetchedTasks = response.data.map(task => ({
        ...task,
        status: mapApiStatusToTaskStatus(task.status),
        order: task.order || 0
      }))
      
      if (projectId !== undefined) {
        const existingProjectTasks = tasks.value.filter(task => task.projectId === projectId)
        const existingIds = new Set(existingProjectTasks.map(t => t.id))
        
        const newTasks = fetchedTasks.filter(task => !existingIds.has(task.id))
        const otherProjectTasks = tasks.value.filter(task => task.projectId !== projectId)
        
        tasks.value = [...otherProjectTasks, ...existingProjectTasks, ...newTasks]
      } else {
        if (!hasStoredData) {
          tasks.value = fetchedTasks
        }
      }
      
      saveToStorage()
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'createdDate' | 'order'>) => {
    loading.value = true
    try {
      const maxOrder = Math.max(
        ...tasks.value
          .filter(t => t.projectId === taskData.projectId)
          .map(t => t.order),
        -1
      )

      const newTaskData: CreateTaskRequest = {
        projectId: taskData.projectId,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority,
        assignee: taskData.assignee,
        dueDate: taskData.dueDate
      }

      const response = await api.createTask(newTaskData)
      const newTask: Task = {
        ...response.data,
        status: mapApiStatusToTaskStatus(response.data.status),
        order: maxOrder + 1
      }
      
      tasks.value.push(newTask)
      saveToStorage()
      toast.success('Задача успешно добавлена')
      return newTask
    } catch (error) {
      toast.error('Ошибка при добавлении задачи')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: number, updates: Partial<Omit<Task, 'id' | 'createdDate' | 'projectId'>>) => {
    loading.value = true
    try {
      const apiUpdates: any = { ...updates }
      if (updates.status) {
        apiUpdates.status = mapTaskStatusToApiStatus(updates.status)
      }

      const response = await api.updateTask(id, apiUpdates)
      if (response.data) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index > -1) {
          const oldTask = tasks.value[index]
          tasks.value[index] = {
            ...response.data,
            status: mapApiStatusToTaskStatus(response.data.status),
            order: oldTask.order
          }
          saveToStorage()
        }
        toast.success('Задача обновлена')
        return tasks.value[index]
      }
      return null
    } catch (error) {
      toast.error('Ошибка при обновлении задачи')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: number) => {
    loading.value = true
    try {
      await api.deleteTask(id)
      const index = tasks.value.findIndex(task => task.id === id)
      if (index > -1) {
        tasks.value.splice(index, 1)
        saveToStorage()
      }
      toast.success('Задача удалена')
      return true
    } catch (error) {
      toast.error('Ошибка при удалении задачи')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteTasksByProjectId = async (projectId: number) => {
    loading.value = true
    try {
      const tasksToDelete = tasks.value.filter(task => task.projectId === projectId)
      
      for (const task of tasksToDelete) {
        try {
          await api.deleteTask(task.id)
        } catch (error) {
          console.log(error)
        }
      }
      
      tasks.value = tasks.value.filter(task => task.projectId !== projectId)
      saveToStorage()
      
      toast.success('Все задачи проекта удалены')
      return true
    } catch {
      toast.error('Ошибка при удалении задач проекта')
    } finally {
      loading.value = false
    }
  }

  const reorderTasks = async (reorderedTasks: Task[]) => {
    loading.value = true
    try {
      reorderedTasks.forEach((task) => {
        const existingTask = tasks.value.find(t => t.id === task.id)
        if (existingTask) {
          existingTask.order = task.order
          existingTask.status = task.status
        }
      })

      tasks.value.sort((a, b) => a.order - b.order)
      
      saveToStorage()
      return true
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: TaskFilters) => {
    filters.value = { ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const setSort = (newSort: TaskSort) => {
    sort.value = { ...newSort }
    saveTableSettings()
  }

  const toggleSort = (column: TaskSort['column']) => {
    if (sort.value.column === column) {
      sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value.column = column
      sort.value.direction = 'asc'
    }
    saveTableSettings()
  }

  const saveTableSettings = (columnWidths?: TableSettings['columnWidths']) => {
    try {
      const settings: TableSettings = {
        sort: sort.value,
        filters: filters.value,
        columnWidths: columnWidths || {
          id: 80,
          title: 300,
          assignee: 150,
          status: 120,
          dueDate: 150
        }
      }
      localStorageHelper.set(LS_KEYS.TABLE_SETTINGS, settings)
    } catch (error) {
      console.log(error)
    }
  }

  const loadTableSettings = () => {
    try {
      const settings = localStorageHelper.get<TableSettings>(LS_KEYS.TABLE_SETTINGS)
      if (settings) {
        sort.value = settings.sort || { column: 'status', direction: 'asc' }
        filters.value = settings.filters || {}
        return settings.columnWidths
      }
    } catch (error) {
      console.log(error)
    }
    return null
  }

  watch(filters, () => saveTableSettings(), { deep: true })

  return {
    tasks,
    loading,
    filters,
    sort,
    getTasksByProjectId,
    filteredTasks,
    getFilteredAndSortedTasks,
    getTasksByStatus,
    kanbanColumns,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    deleteTasksByProjectId,
    reorderTasks,
    setFilters,
    clearFilters,
    setSort,
    toggleSort,
    saveTableSettings,
    loadTableSettings,
    initializeFromStorage,
    saveToStorage,
    mapApiStatusToTaskStatus,
    mapTaskStatusToApiStatus
  }
})
