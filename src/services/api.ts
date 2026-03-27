import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { mockApi, CreateProjectRequest, CreateTaskRequest } from './mockApi'
import { IProject } from '../mocks/projects'
import { ITask } from '../mocks/tasks'

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
  async getProjects(): Promise<AxiosResponse<IProject[]>> {
    const projects = await mockApi.getProjects()
    return mockResponse(projects)
  },

  async createProject(projectData: CreateProjectRequest): Promise<AxiosResponse<IProject>> {
    const project = await mockApi.createProject(projectData)
    return mockResponse(project)
  },

  async getProject(id: number): Promise<AxiosResponse<IProject | null>> {
    const project = await mockApi.getProject(id)
    return mockResponse(project)
  },

  async updateProject(id: number, updates: Partial<Omit<IProject, 'id' | 'createdDate' | 'taskCount'>>): Promise<AxiosResponse<IProject | null>> {
    const project = await mockApi.updateProject(id, updates)
    return mockResponse(project)
  },

  async deleteProject(id: number): Promise<AxiosResponse<boolean>> {
    const result = await mockApi.deleteProject(id)
    return mockResponse(result)
  },

  async getTasks(projectId?: number): Promise<AxiosResponse<ITask[]>> {
    const tasks = await mockApi.getTasks(projectId)
    return mockResponse(tasks)
  },

  async createTask(taskData: CreateTaskRequest): Promise<AxiosResponse<ITask>> {
    const task = await mockApi.createTask(taskData)
    return mockResponse(task)
  },

  async getTask(id: number): Promise<AxiosResponse<ITask | null>> {
    const task = await mockApi.getTask(id)
    return mockResponse(task)
  },

  async updateTask(id: number, updates: Partial<Omit<ITask, 'id' | 'createdDate' | 'projectId'>>): Promise<AxiosResponse<ITask | null>> {
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

export type { IProject, ITask, CreateProjectRequest, CreateTaskRequest }
export { apiClient }
