import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'
import type { ITask as ApiTask, CreateTaskRequest } from '../services/api'

// Enhanced Task interface matching requirements
export interface Task extends Omit<ApiTask, 'status'> {
  status: 'todo' | 'in-progress' | 'done'
  order: number
}

// Filter types
export interface TaskFilters {
  status?: Task['status']
  assignee?: string
}

// Kanban column type
export interface KanbanColumn {
  status: Task['status']
  tasks: Task[]
}

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const filters = ref<TaskFilters>({})

  // Getters
  const getTasksByProjectId = computed(() => {
    return (projectId: number) => {
      return tasks.value
        .filter(task => task.projectId === projectId)
        .sort((a, b) => a.order - b.order)
    }
  })

  const filteredTasks = computed(() => {
    let filtered = [...tasks.value]

    // Apply status filter
    if (filters.value.status) {
      filtered = filtered.filter(task => task.status === filters.value.status)
    }

    // Apply assignee filter
    if (filters.value.assignee) {
      filtered = filtered.filter(task => task.assignee === filters.value.assignee)
    }

    // Sort by order
    return filtered.sort((a, b) => a.order - b.order)
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

    // Sort tasks within each status by order
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

  // Actions
  const fetchTasks = async (projectId?: number) => {
    loading.value = true
    try {
      const response = await api.getTasks(projectId)
      const fetchedTasks = response.data.map(task => ({
        ...task,
        status: mapApiStatusToTaskStatus(task.status),
        order: task.order || 0
      }))
      
      if (projectId !== undefined) {
        // Replace tasks for specific project
        const otherProjectTasks = tasks.value.filter(task => task.projectId !== projectId)
        tasks.value = [...otherProjectTasks, ...fetchedTasks]
      } else {
        // Replace all tasks
        tasks.value = fetchedTasks
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'createdDate' | 'order'>) => {
    loading.value = true
    try {
      // Find the highest order for this project
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
      return newTask
    } catch (error) {
      console.error('Failed to add task:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: number, updates: Partial<Omit<Task, 'id' | 'createdDate' | 'projectId'>>) => {
    loading.value = true
    try {
      // Map status back to API format if present
      const apiUpdates: any = { ...updates }
      if (updates.status) {
        apiUpdates.status = mapTaskStatusToApiStatus(updates.status)
      }

      const response = await api.updateTask(id, apiUpdates)
      if (response.data) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index > -1) {
          tasks.value[index] = {
            ...response.data,
            status: mapApiStatusToTaskStatus(response.data.status),
            order: tasks.value[index].order // Preserve existing order
          }
        }
        return tasks.value[index]
      }
      return null
    } catch (error) {
      console.error('Failed to update task:', error)
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
      }
      return true
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const reorderTasks = async (reorderedTasks: Task[]) => {
    loading.value = true
    try {
      // Update local state immediately for responsive UI
      reorderedTasks.forEach((task, index) => {
        const existingTask = tasks.value.find(t => t.id === task.id)
        if (existingTask) {
          existingTask.order = index
          existingTask.status = task.status
        }
      })

      // Sort tasks by order to maintain consistency
      tasks.value.sort((a, b) => a.order - b.order)

      // Note: In a real implementation, you would make API calls here
      // to persist the new order and status changes
      // For now, we'll just update the local state
      
      return true
    } catch (error) {
      console.error('Failed to reorder tasks:', error)
      throw error
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

  // Helper functions to map between API status and task status
  const mapApiStatusToTaskStatus = (apiStatus: string): Task['status'] => {
    switch (apiStatus) {
      case 'Pending': return 'todo'
      case 'In Progress': return 'in-progress'
      case 'Completed': return 'done'
      case 'Blocked': return 'todo' // Map blocked to todo for now
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

  return {
    // State
    tasks,
    loading,
    filters,
    
    // Getters
    getTasksByProjectId,
    filteredTasks,
    getTasksByStatus,
    kanbanColumns,
    
    // Actions
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    setFilters,
    clearFilters
  }
})
