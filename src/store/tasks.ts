import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: Date
}

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const filter = ref<'all' | 'active' | 'completed'>('all')
  
  // Actions
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    tasks.value.push(newTask)
  }
  
  const removeTask = (id: string) => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index > -1) {
      tasks.value.splice(index, 1)
    }
  }
  
  const toggleTask = (id: string) => {
    const task = tasks.value.find(task => task.id === id)
    if (task) {
      task.completed = !task.completed
    }
  }
  
  const setFilter = (newFilter: 'all' | 'active' | 'completed') => {
    filter.value = newFilter
  }
  
  return {
    // State
    tasks,
    filter,
    // Actions
    addTask,
    removeTask,
    toggleTask,
    setFilter
  }
})
