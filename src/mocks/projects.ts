import { Task } from './tasks'

export interface Project {
  id: number
  name: string
  description: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
  createdDate: string
  taskCount: number
  tasks?: Task[]
}

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design and improved UX',
    status: 'In Progress',
    createdDate: '2024-01-15',
    taskCount: 12
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Native iOS and Android app for customer engagement',
    status: 'Planning',
    createdDate: '2024-02-01',
    taskCount: 8
  },
  {
    id: 3,
    name: 'API Integration',
    description: 'Third-party API integration for payment processing',
    status: 'Completed',
    createdDate: '2024-01-10',
    taskCount: 5
  },
  {
    id: 4,
    name: 'Database Migration',
    description: 'Migrate from legacy database to cloud-based solution',
    status: 'On Hold',
    createdDate: '2024-02-15',
    taskCount: 15
  },
  {
    id: 5,
    name: 'Security Audit',
    description: 'Comprehensive security assessment and implementation',
    status: 'Planning',
    createdDate: '2024-03-01',
    taskCount: 7
  }
]
