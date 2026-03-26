import { mockProjects, Project } from '../mocks/projects'
import { mockTasks, Task } from '../mocks/tasks'

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

let projects = [...mockProjects]
let tasks = [...mockTasks]
let nextProjectId = Math.max(...projects.map(p => p.id)) + 1
let nextTaskId = Math.max(...tasks.map(t => t.id)) + 1

export interface CreateProjectRequest {
  name: string
  description: string
  status?: Project['status']
}

export interface CreateTaskRequest {
  projectId: number
  title: string
  description: string
  priority: Task['priority']
  assignee?: string
  dueDate?: string
}

export const mockApi = {
  async getProjects(): Promise<Project[]> {
    await delay(300)
    return [...projects]
  },

  async getProject(id: number): Promise<Project | null> {
    await delay(200)
    const project = projects.find(p => p.id === id)
    if (!project) return null
    
    const projectTasks = tasks.filter(t => t.projectId === id)
    return {
      ...project,
      taskCount: projectTasks.length,
      tasks: projectTasks
    }
  },

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    await delay(400)
    
    const newProject: Project = {
      id: nextProjectId++,
      name: projectData.name,
      description: projectData.description,
      status: projectData.status || 'Planning',
      createdDate: new Date().toISOString().split('T')[0],
      taskCount: 0
    }
    
    projects.push(newProject)
    return newProject
  },

  async updateProject(id: number, updates: Partial<Omit<Project, 'id' | 'createdDate' | 'taskCount'>>): Promise<Project | null> {
    await delay(300)
    
    const projectIndex = projects.findIndex(p => p.id === id)
    if (projectIndex === -1) return null
    
    projects[projectIndex] = { ...projects[projectIndex], ...updates }
    return projects[projectIndex]
  },

  async deleteProject(id: number): Promise<boolean> {
    await delay(200)
    
    const projectIndex = projects.findIndex(p => p.id === id)
    if (projectIndex === -1) return false
    
    projects.splice(projectIndex, 1)
    tasks = tasks.filter(t => t.projectId !== id)
    
    return true
  },

  async getTasks(projectId?: number): Promise<Task[]> {
    await delay(250)
    
    if (projectId) {
      return tasks.filter(t => t.projectId === projectId)
    }
    return [...tasks]
  },

  async getTask(id: number): Promise<Task | null> {
    await delay(150)
    return tasks.find(t => t.id === id) || null
  },

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    await delay(350)
    
    const project = projects.find(p => p.id === taskData.projectId)
    if (!project) {
      throw new Error('Project not found')
    }
    
    const newTask: Task = {
      id: nextTaskId++,
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0]
    }
    
    tasks.push(newTask)
    
    const projectIndex = projects.findIndex(p => p.id === taskData.projectId)
    if (projectIndex !== -1) {
      projects[projectIndex].taskCount = tasks.filter(t => t.projectId === taskData.projectId).length
    }
    
    return newTask
  },

  async updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'createdDate' | 'projectId'>>): Promise<Task | null> {
    await delay(250)
    
    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) return null
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates }
    return tasks[taskIndex]
  },

  async deleteTask(id: number): Promise<boolean> {
    await delay(150)
    
    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) return false
    
    const task = tasks[taskIndex]
    tasks.splice(taskIndex, 1)
    
    const projectIndex = projects.findIndex(p => p.id === task.projectId)
    if (projectIndex !== -1) {
      projects[projectIndex].taskCount = tasks.filter(t => t.projectId === task.projectId).length
    }
    
    return true
  },

  async resetData(): Promise<void> {
    await delay(100)
    projects = [...mockProjects]
    tasks = [...mockTasks]
    nextProjectId = Math.max(...projects.map(p => p.id)) + 1
    nextTaskId = Math.max(...tasks.map(t => t.id)) + 1
  }
}
