export interface ITask {
  id: number
  title: string
  description: string
  status: string
}

export interface IProject {
  id: number
  name: string
  description: string
  status: string
  createdDate: string
  taskCount: number
  tasks?: ITask[]
}
