import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { mockApi, CreateProjectRequest, CreateTaskRequest } from './mockApi'
import { Project } from '../mocks/projects'
import { Task } from '../mocks/tasks'

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  async (config) => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return config
  },
  (error) => Promise.reject(error)
)


const mockResponse = <T>(data: T): Promise<AxiosResponse<T>> => {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  })
}

export const api = {
  async getProjects(): Promise<AxiosResponse<Project[]>> {
    const projects = await mockApi.getProjects()
    return mockResponse(projects)
  },

  async createProject(projectData: CreateProjectRequest): Promise<AxiosResponse<Project>> {
    const project = await mockApi.createProject(projectData)
    return mockResponse(project)
  },

  async getProject(id: number): Promise<AxiosResponse<Project | null>> {
    const project = await mockApi.getProject(id)
    return mockResponse(project)
  },

  async updateProject(id: number, updates: Partial<Omit<Project, 'id' | 'createdDate' | 'taskCount'>>): Promise<AxiosResponse<Project | null>> {
    const project = await mockApi.updateProject(id, updates)
    return mockResponse(project)
  },

  async deleteProject(id: number): Promise<AxiosResponse<boolean>> {
    const result = await mockApi.deleteProject(id)
    return mockResponse(result)
  },

  async getTasks(projectId?: number): Promise<AxiosResponse<Task[]>> {
    const tasks = await mockApi.getTasks(projectId)
    return mockResponse(tasks)
  },

  async createTask(taskData: CreateTaskRequest): Promise<AxiosResponse<Task>> {
    const task = await mockApi.createTask(taskData)
    return mockResponse(task)
  },

  async getTask(id: number): Promise<AxiosResponse<Task | null>> {
    const task = await mockApi.getTask(id)
    return mockResponse(task)
  },

  async updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'createdDate' | 'projectId'>>): Promise<AxiosResponse<Task | null>> {
    const task = await mockApi.updateTask(id, updates)
    return mockResponse(task)
  },

  async deleteTask(id: number): Promise<AxiosResponse<boolean>> {
    const result = await mockApi.deleteTask(id)
    return mockResponse(result)
  },

  async resetData(): Promise<AxiosResponse<void>> {
    await mockApi.resetData()
    return mockResponse(undefined)
  }
}

// Export types for external use
export type { Project, Task, CreateProjectRequest, CreateTaskRequest }
export { apiClient }
