export interface ITask {
  id: number
  projectId: number
  title: string
  description: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  assignee?: string
  dueDate?: string
  createdDate: string
  order: number
}

export const mockTasks: ITask[] = [
  {
    id: 1,
    projectId: 1,
    title: 'Design mockups',
    description: 'Create initial design concepts and wireframes',
    status: 'Completed',
    priority: 'High',
    assignee: 'John Doe',
    dueDate: '2024-02-01',
    createdDate: '2024-01-16',
    order: 0
  },
  {
    id: 2,
    projectId: 1,
    title: 'Frontend development',
    description: 'Implement responsive design with Vue.js',
    status: 'In Progress',
    priority: 'High',
    assignee: 'Jane Smith',
    dueDate: '2024-02-15',
    createdDate: '2024-01-17',
    order: 1
  },
  {
    id: 3,
    projectId: 1,
    title: 'Content migration',
    description: 'Migrate existing content to new design',
    status: 'Pending',
    priority: 'Medium',
    assignee: 'Mike Johnson',
    dueDate: '2024-02-20',
    createdDate: '2024-01-18',
    order: 2
  },
  {
    id: 4,
    projectId: 1,
    title: 'SEO optimization',
    description: 'Optimize new design for search engines',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '2024-02-25',
    createdDate: '2024-01-19',
    order: 3
  },
  
  // Mobile App Development Tasks
  {
    id: 5,
    projectId: 2,
    title: 'Requirements gathering',
    description: 'Define app requirements and user stories',
    status: 'In Progress',
    priority: 'High',
    assignee: 'Sarah Wilson',
    dueDate: '2024-02-10',
    createdDate: '2024-02-02',
    order: 4
  },
  {
    id: 6,
    projectId: 2,
    title: 'UI/UX design',
    description: 'Design app interface and user experience',
    status: 'Pending',
    priority: 'High',
    assignee: 'Tom Brown',
    dueDate: '2024-02-20',
    createdDate: '2024-02-03',
    order: 5
  },
  {
    id: 7,
    projectId: 2,
    title: 'Backend API development',
    description: 'Create RESTful API for mobile app',
    status: 'Pending',
    priority: 'High',
    assignee: 'Alex Davis',
    dueDate: '2024-03-01',
    createdDate: '2024-02-04',
    order: 6
  },
  
  // API Integration Tasks
  {
    id: 8,
    projectId: 3,
    title: 'API research',
    description: 'Research available payment processing APIs',
    status: 'Completed',
    priority: 'Medium',
    assignee: 'Chris Lee',
    dueDate: '2024-01-20',
    createdDate: '2024-01-11',
    order: 7
  },
  {
    id: 9,
    projectId: 3,
    title: 'Integration setup',
    description: 'Set up API connections and authentication',
    status: 'Completed',
    priority: 'High',
    assignee: 'Pat Kim',
    dueDate: '2024-01-25',
    createdDate: '2024-01-12',
    order: 8
  },
  {
    id: 10,
    projectId: 3,
    title: 'Testing and validation',
    description: 'Test API integration and validate transactions',
    status: 'Completed',
    priority: 'High',
    assignee: 'Sam Taylor',
    dueDate: '2024-01-30',
    createdDate: '2024-01-13',
    order: 9
  },
  
  // Database Migration Tasks
  {
    id: 11,
    projectId: 4,
    title: 'Schema design',
    description: 'Design new database schema for cloud solution',
    status: 'Completed',
    priority: 'High',
    assignee: 'Jordan Martinez',
    dueDate: '2024-02-20',
    createdDate: '2024-02-16',
    order: 10
  },
  {
    id: 12,
    projectId: 4,
    title: 'Data migration script',
    description: 'Create scripts to migrate existing data',
    status: 'Blocked',
    priority: 'High',
    assignee: 'Casey Robinson',
    dueDate: '2024-02-25',
    createdDate: '2024-02-17',
    order: 11
  },
  
  // Security Audit Tasks
  {
    id: 13,
    projectId: 5,
    title: 'Vulnerability assessment',
    description: 'Conduct comprehensive security vulnerability assessment',
    status: 'Pending',
    priority: 'Critical',
    assignee: 'Morgan Bailey',
    dueDate: '2024-03-10',
    createdDate: '2024-03-02',
    order: 12
  },
  {
    id: 14,
    projectId: 5,
    title: 'Security implementation',
    description: 'Implement recommended security measures',
    status: 'Pending',
    priority: 'High',
    assignee: 'Morgan Bailey',
    dueDate: '2024-03-20',
    createdDate: '2024-03-03',
    order: 13
  }
]
