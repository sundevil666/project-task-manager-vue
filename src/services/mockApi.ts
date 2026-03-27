import { IProject } from '../mocks/projects'
import { ITask } from '../mocks/tasks'

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

const getProjects = (): IProject[] => {
  const stored = localStorage.getItem('projects')
  return stored ? JSON.parse(stored) : []
}

const getTasks = (): ITask[] => {
  const stored = localStorage.getItem('tasks')
  return stored ? JSON.parse(stored) : []
}

const saveProjects = (projects: IProject[]) => {
  localStorage.setItem('projects', JSON.stringify(projects))
}

const saveTasks = (tasks: ITask[]) => {
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

const getNextProjectId = (): number => {
  const projects = getProjects()
  return projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1
}

const getNextTaskId = (): number => {
  const tasks = getTasks()
  return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
}

export interface CreateProjectRequest {
  name: string
  description: string
  status?: IProject['status']
}

export interface CreateTaskRequest {
  projectId: number
  title: string
  description: string
  priority: ITask['priority']
  assignee?: string
  dueDate?: string
}

export const mockApi = {
  async getProjects(): Promise<IProject[]> {
    await delay(300)
    return getProjects()
  },

  async getProject(id: number): Promise<IProject | null> {
    await delay(200)
    const projects = getProjects()
    const project = projects.find(p => p.id === id)
    if (!project) return null
    
    const tasks = getTasks()
    const projectTasks = tasks.filter(t => t.projectId === id)
    return {
      ...project,
      taskCount: projectTasks.length,
      tasks: projectTasks
    }
  },

  async createProject(projectData: CreateProjectRequest): Promise<IProject> {
    await delay(400)
    
    const projects = getProjects()
    const newProject: IProject = {
      id: getNextProjectId(),
      name: projectData.name,
      description: projectData.description,
      status: projectData.status || 'Planning',
      createdDate: new Date().toISOString().split('T')[0],
      taskCount: 0
    }
    
    projects.push(newProject)
    saveProjects(projects)
    return newProject
  },

  async updateProject(id: number, updates: Partial<Omit<IProject, 'id' | 'createdDate' | 'taskCount'>>): Promise<IProject | null> {
    await delay(300)
    
    const projects = getProjects()
    const projectIndex = projects.findIndex(p => p.id === id)
    if (projectIndex === -1) return null
    
    projects[projectIndex] = { ...projects[projectIndex], ...updates }
    saveProjects(projects)
    return projects[projectIndex]
  },

  async deleteProject(id: number): Promise<boolean> {
    await delay(200)
    
    const projects = getProjects()
    const tasks = getTasks()
    
    const projectIndex = projects.findIndex(p => p.id === id)
    if (projectIndex === -1) return false
    
    projects.splice(projectIndex, 1)
    saveProjects(projects)
    
    const filteredTasks = tasks.filter(t => t.projectId !== id)
    saveTasks(filteredTasks)
    
    return true
  },

  async getTasks(projectId?: number): Promise<ITask[]> {
    await delay(250)
    
    const tasks = getTasks()
    if (projectId) {
      return tasks.filter(t => t.projectId === projectId)
    }
    return tasks
  },

  async getTask(id: number): Promise<ITask | null> {
    await delay(150)
    const tasks = getTasks()
    return tasks.find(t => t.id === id) || null
  },

  async createTask(taskData: CreateTaskRequest): Promise<ITask> {
    await delay(350)
    
    const projects = getProjects()
    const tasks = getTasks()
    
    const project = projects.find(p => p.id === taskData.projectId)
    if (!project) {
      throw new Error('Project not found')
    }
    
    const newTask: ITask = {
      id: getNextTaskId(),
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0],
      order: tasks.filter(t => t.projectId === taskData.projectId).length
    }
    
    tasks.push(newTask)
    saveTasks(tasks)
    
    const projectIndex = projects.findIndex(p => p.id === taskData.projectId)
    if (projectIndex !== -1) {
      projects[projectIndex].taskCount = tasks.filter(t => t.projectId === taskData.projectId).length
      saveProjects(projects)
    }
    
    return newTask
  },

  async updateTask(id: number, updates: Partial<Omit<ITask, 'id' | 'createdDate' | 'projectId'>>): Promise<ITask | null> {
    await delay(250)
    
    const tasks = getTasks()
    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) return null
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates }
    saveTasks(tasks)
    return tasks[taskIndex]
  },

  async deleteTask(id: number): Promise<boolean> {
    await delay(150)
    
    const projects = getProjects()
    const tasks = getTasks()
    
    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) return false
    
    const task = tasks[taskIndex]
    tasks.splice(taskIndex, 1)
    saveTasks(tasks)
    
    const projectIndex = projects.findIndex(p => p.id === task.projectId)
    if (projectIndex !== -1) {
      projects[projectIndex].taskCount = tasks.filter(t => t.projectId === task.projectId).length
      saveProjects(projects)
    }
    
    return true
  },

  async resetData(): Promise<void> {
    await delay(100)
    localStorage.removeItem('projects')
    localStorage.removeItem('tasks')
  }
}
