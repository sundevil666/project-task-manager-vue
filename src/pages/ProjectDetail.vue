<template>
  <div class="project-detail">
    <div class="header">
      <button @click="goBack" class="back-button">← Назад</button>
      <div class="header-content">
        <h1>{{ project?.name }}</h1>
        <button @click="confirmDeleteProject" class="delete-button">🗑️ Удалить проект</button>
      </div>
    </div>
    
    <div v-if="project" class="project-content">
      <div class="controls">
        <div class="mode-switcher">
          <button 
            @click="setMode('table')" 
            :class="['mode-btn', { active: viewMode === 'table' }]"
          >
            Table
          </button>
          <button 
            @click="setMode('kanban')" 
            :class="['mode-btn', { active: viewMode === 'kanban' }]"
          >
            Kanban
          </button>
        </div>
        <button @click="openCreateModal" class="add-task-btn">+ Добавить задачу</button>
      </div>
      
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="assignee-filter">Исполнитель:</label>
          <input 
            id="assignee-filter"
            v-model="assigneeFilter" 
            type="text" 
            placeholder="Фильтр по исполнителю"
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label for="status-filter">Статус:</label>
          <select 
            id="status-filter"
            v-model="statusFilter" 
            class="filter-select"
          >
            <option value="">Все статусы</option>
            <option value="todo">К выполнению</option>
            <option value="in-progress">В работе</option>
            <option value="done">Завершено</option>
          </select>
        </div>
        <button 
          v-if="hasActiveFilters" 
          @click="clearFilters" 
          class="clear-filters-btn"
        >
          Очистить фильтры
        </button>
      </div>
      
      <div class="tasks-container">
        <div v-if="viewMode === 'table'" class="table-view">
          <div v-if="isLoading" class="loading-state">
            <p>Loading...</p>
          </div>
          <div v-else-if="projectTasks.length === 0" class="empty-state">
            <p>Нет задач</p>
          </div>
          <table v-else class="tasks-table">
            <thead>
              <tr>
                <th 
                  @click="handleSort('title')" 
                  class="sortable-header"
                  :style="{ width: columnWidths.title + 'px' }"
                >
                  Название
                  <span class="sort-indicator" v-if="sort.column === 'title'">
                    {{ sort.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                  <div class="resize-handle" @mousedown="startResize($event, 'title')"></div>
                </th>
                <th 
                  @click="handleSort('assignee')" 
                  class="sortable-header"
                  :style="{ width: columnWidths.assignee + 'px' }"
                >
                  Исполнитель
                  <span class="sort-indicator" v-if="sort.column === 'assignee'">
                    {{ sort.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                  <div class="resize-handle" @mousedown="startResize($event, 'assignee')"></div>
                </th>
                <th 
                  @click="handleSort('status')" 
                  class="sortable-header"
                  :style="{ width: columnWidths.status + 'px' }"
                >
                  Статус
                  <span class="sort-indicator" v-if="sort.column === 'status'">
                    {{ sort.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                  <div class="resize-handle" @mousedown="startResize($event, 'status')"></div>
                </th>
                <th 
                  @click="handleSort('dueDate')" 
                  class="sortable-header"
                  :style="{ width: columnWidths.dueDate + 'px' }"
                >
                  Термин выполнения
                  <span class="sort-indicator" v-if="sort.column === 'dueDate'">
                    {{ sort.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                  <div class="resize-handle" @mousedown="startResize($event, 'dueDate')"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in displayTasks" :key="task.id">
                <td :style="{ width: columnWidths.title + 'px' }" @click="openEditModal(task)" class="task-title">{{ task.title }}</td>
                <td :style="{ width: columnWidths.assignee + 'px' }">{{ task.assignee || '-' }}</td>
                <td :style="{ width: columnWidths.status + 'px' }">
                  <span :class="['status-badge', `status-${task.status}`]">
                    {{ getStatusText(task.status) }}
                  </span>
                </td>
                <td :style="{ width: columnWidths.dueDate + 'px' }">{{ task.dueDate || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else-if="viewMode === 'kanban'" class="kanban-view">
          <div class="kanban-columns">
            <KanbanColumn
              title="К выполнению"
              :tasks="todoTasks"
              status="todo"
              :on-task-move="handleTaskMove"
              :on-task-reorder="handleTaskReorder"
              :on-edit-task="openEditModal"
            />
            <KanbanColumn
              title="В работе"
              :tasks="inProgressTasks"
              status="in-progress"
              :on-task-move="handleTaskMove"
              :on-task-reorder="handleTaskReorder"
              :on-edit-task="openEditModal"
            />
            <KanbanColumn
              title="Завершено"
              :tasks="doneTasks"
              status="done"
              :on-task-move="handleTaskMove"
              :on-task-reorder="handleTaskReorder"
              :on-edit-task="openEditModal"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <h2>Проект не найден</h2>
      <p>Проект, который вы ищете, не существует.</p>
      <button @click="goBack" class="back-button">Вернуться к проектам</button>
    </div>
    
    <!-- Task Modal -->
    <TaskModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :task="selectedTask"
      :project-id="projectId"
      @close="closeModal"
    />
    
    <!-- Delete Project Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="confirm-modal">
        <h3>Удалить проект?</h3>
        <p>Вы уверены, что хотите удалить проект "{{ project?.name }}"?</p>
        <p class="warning">⚠️ Все задачи в этом проекте также будут удалены!</p>
        <div class="modal-actions">
          <button @click="cancelDeleteProject" class="cancel-btn">Отмена</button>
          <button @click="deleteProject" class="confirm-delete-btn">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from '../store/tasks'
import { useProjectsStore } from '../store/projects'
import TaskModal from '../components/TaskModal.vue'
import KanbanColumn from '../components/KanbanColumn.vue'
import type { IProject } from '../types'
import type { Task } from '../store/tasks'
import { localStorageHelper, LS_KEYS } from '../utils/localStorage'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()
const projectsStore = useProjectsStore()

const viewMode = ref<'table' | 'kanban'>('table')

// Initialize view mode from LocalStorage
const initializeViewMode = () => {
  const savedMode = localStorageHelper.get<'table' | 'kanban'>(LS_KEYS.VIEW_MODE)
  if (savedMode) {
    viewMode.value = savedMode
  }
}

// Save view mode to LocalStorage
const saveViewMode = () => {
  localStorageHelper.set(LS_KEYS.VIEW_MODE, viewMode.value)
}

// Initialize on mount
onMounted(async () => {
  initializeViewMode()
  
  // Initialize projects and tasks data
  await projectsStore.fetchProjects()
  await taskStore.fetchTasks(projectId.value)
})

// Watch for view mode changes
watch(viewMode, saveViewMode)

// Modal state
const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedTask = ref<Task | undefined>()

// Delete project state
const showDeleteConfirm = ref(false)

// Column widths for resizing
const columnWidths = ref({
  title: 300,
  assignee: 150,
  status: 120,
  dueDate: 150
})

// Resize state
const resizing = ref(false)
const resizingColumn = ref<keyof typeof columnWidths.value | null>(null)
const startX = ref(0)
const startWidth = ref(0)

const setMode = (mode: 'table' | 'kanban') => {
  viewMode.value = mode
  // No data refetching needed - both views use the same store
}

const project = computed(() => {
  const projectId = Number(route.params.id)
  return projectsStore.getProjectById(projectId)
})

const projectId = computed(() => Number(route.params.id))
const projectTasks = computed(() => taskStore.getTasksByProjectId(projectId.value))
const isLoading = computed(() => taskStore.loading)
const sort = computed(() => taskStore.sort)

// Kanban tasks grouped by status - using project tasks and applying filters
const todoTasks = computed(() => {
  // Skip entire column if status filter is set to something else
  if (statusFilter.value && statusFilter.value !== 'todo') return []
  
  return projectTasks.value
    .filter((task: Task) => task.status === 'todo')
    .filter((task: Task) => !assigneeFilter.value || task.assignee?.toLowerCase().includes(assigneeFilter.value.toLowerCase()))
})
const inProgressTasks = computed(() => {
  // Skip entire column if status filter is set to something else
  if (statusFilter.value && statusFilter.value !== 'in-progress') return []
  
  return projectTasks.value
    .filter((task: Task) => task.status === 'in-progress')
    .filter((task: Task) => !assigneeFilter.value || task.assignee?.toLowerCase().includes(assigneeFilter.value.toLowerCase()))
})
const doneTasks = computed(() => {
  // Skip entire column if status filter is set to something else
  if (statusFilter.value && statusFilter.value !== 'done') return []
  
  return projectTasks.value
    .filter((task: Task) => task.status === 'done')
    .filter((task: Task) => !assigneeFilter.value || task.assignee?.toLowerCase().includes(assigneeFilter.value.toLowerCase()))
})

// Filter reactive refs
const assigneeFilter = ref('')
const statusFilter = ref('')

// Computed property for filtered and sorted tasks
const displayTasks = computed(() => {
  return taskStore.getFilteredAndSortedTasks(projectId.value)
})

// Check if filters are active
const hasActiveFilters = computed(() => {
  return assigneeFilter.value.trim() !== '' || statusFilter.value !== ''
})

// Watch for filter changes and update store
watch([assigneeFilter, statusFilter], ([newAssignee, newStatus]) => {
  taskStore.setFilters({
    assignee: newAssignee.trim() || undefined,
    status: newStatus as any || undefined
  })
})

// Sort handler
const handleSort = (column: 'status' | 'dueDate' | 'title' | 'assignee') => {
  taskStore.toggleSort(column)
}

// Clear filters
const clearFilters = () => {
  assigneeFilter.value = ''
  statusFilter.value = ''
  taskStore.clearFilters()
}

// Column resizing handlers
const startResize = (event: MouseEvent, column: keyof typeof columnWidths.value) => {
  event.preventDefault()
  resizing.value = true
  resizingColumn.value = column
  startX.value = event.clientX
  startWidth.value = columnWidths.value[column]
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!resizing.value || !resizingColumn.value) return
  
  const diff = event.clientX - startX.value
  const newWidth = Math.max(80, startWidth.value + diff) // Minimum width of 80px
  columnWidths.value[resizingColumn.value] = newWidth
}

const stopResize = () => {
  resizing.value = false
  resizingColumn.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const goBack = () => {
  router.push('/')
}

onMounted(async () => {
  if (projectId.value) {
    await taskStore.fetchTasks(projectId.value)
  }
})

// Watch for project changes (not view mode changes)
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await taskStore.fetchTasks(Number(newId))
  }
}, { immediate: false })

const getStatusText = (status: string) => {
  switch (status) {
    case 'todo': return 'К выполнению'
    case 'in-progress': return 'В работе'
    case 'done': return 'Завершено'
    default: return status
  }
}

// Modal functions
const openCreateModal = () => {
  modalMode.value = 'create'
  selectedTask.value = undefined
  isModalOpen.value = true
}

const openEditModal = (task: Task) => {
  modalMode.value = 'edit'
  selectedTask.value = task
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTask.value = undefined
}

// Delete project functions
const confirmDeleteProject = () => {
  showDeleteConfirm.value = true
}

const cancelDeleteProject = () => {
  showDeleteConfirm.value = false
}

const deleteProject = async () => {
  if (!project.value) return
  
  try {
    // Delete all tasks for this project
    await taskStore.deleteTasksByProjectId(project.value.id)
    
    // Delete the project
    await projectsStore.deleteProject(project.value.id)
    
    // Redirect to projects page
    router.push('/')
  } catch (error) {
    console.error('Failed to delete project:', error)
  }
}

// Kanban drag & drop handlers
const handleTaskMove = async (taskId: number, newStatus: Task['status'], newOrder: number) => {
  try {
    await taskStore.updateTask(taskId, { status: newStatus })
    
    // Use projectTasks
    const allProjectTasks = projectTasks.value
    
    // Group tasks by status for this project
    const statusGroups = {
      'todo': allProjectTasks.filter(t => t.status === 'todo'),
      'in-progress': allProjectTasks.filter(t => t.status === 'in-progress'),
      'done': allProjectTasks.filter(t => t.status === 'done')
    }
    
    const reorderedTasks: Task[] = []
    
    // Helper to insert task at specific position
    const insertTaskAtPosition = (tasks: Task[], insertOrder: number) => {
      const movedTask = tasks.find(t => t.id === taskId)
      if (!movedTask) return tasks
      
      const newTasks = tasks.filter(t => t.id !== taskId)
      newTasks.splice(insertOrder, 0, movedTask)
      return newTasks
    }
    
    // Reorder the target status column
    const targetTasks = statusGroups[newStatus].filter(task => task.projectId === projectId.value)
    const reorderedTargetTasks = insertTaskAtPosition(targetTasks, newOrder)
    
    // Build the complete reordered list
    const allStatuses: Task['status'][] = ['todo', 'in-progress', 'done']
    allStatuses.forEach(status => {
      const statusTasks = status === newStatus 
        ? reorderedTargetTasks
        : statusGroups[status].filter(task => task.projectId === projectId.value)
      
      statusTasks.forEach((task, index) => {
        reorderedTasks.push({ ...task, order: index })
      })
    })
    
    await taskStore.reorderTasks(reorderedTasks)
  } catch (error) {
    console.error('Failed to move task:', error)
  }
}

const handleTaskReorder = async (taskId: number, newOrder: number) => {
  try {
    // Use projectTasks
    const allProjectTasks = projectTasks.value
    
    // Group tasks by status for this project
    const statusGroups = {
      'todo': allProjectTasks.filter(t => t.status === 'todo'),
      'in-progress': allProjectTasks.filter(t => t.status === 'in-progress'),
      'done': allProjectTasks.filter(t => t.status === 'done')
    }
    
    const reorderedTasks: Task[] = []
    
    // Find which status the task belongs to
    let taskStatus: Task['status'] | null = null
    for (const [status, tasks] of Object.entries(statusGroups)) {
      if (tasks.some(t => t.id === taskId)) {
        taskStatus = status as Task['status']
        break
      }
    }
    
    if (!taskStatus) return
    
    // Reorder tasks within the same status
    const statusTasks = statusGroups[taskStatus]
    const movedTask = statusTasks.find(t => t.id === taskId)
    if (!movedTask) return
    
    const newTasks = [...statusTasks]
    const currentIndex = newTasks.findIndex(t => t.id === taskId)
    
    newTasks.splice(currentIndex, 1)
    newTasks.splice(newOrder, 0, movedTask)
    
    // Build the complete reordered list
    const allStatuses: Task['status'][] = ['todo', 'in-progress', 'done']
    allStatuses.forEach(status => {
      const statusTasks = status === taskStatus 
        ? newTasks
        : statusGroups[status]
      
      statusTasks.forEach((task, index) => {
        reorderedTasks.push({ ...task, order: index })
      })
    })
    
    await taskStore.reorderTasks(reorderedTasks)
  } catch (error) {
    console.error('Failed to reorder task:', error)
  }
}
</script>

<style lang="scss" scoped>
.project-detail {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.header {
  margin-bottom: 2rem;
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    justify-content: space-between;
  }
  
  .back-button {
    background: none;
    border: none;
    color: #42b883;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(66, 184, 131, 0.1);
    }
  }
  
  .delete-button {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    
    &:hover {
      background: #dc2626;
    }
  }
  
  h1 {
    margin: 0;
    color: #2c3e50;
    font-size: 2rem;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.mode-switcher {
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
  
  .mode-btn {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    color: #666;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    font-size: 0.9rem;
    
    &.active {
      background: white;
      color: #42b883;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.add-task-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #369870;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
}

.filters-section {
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #2c3e50;
  }
}

.filter-input,
.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #42b883;
    box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
  }
}

.clear-filters-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  height: fit-content;
  
  &:hover {
    background: #c0392b;
  }
}

.tasks-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 400px;
}

.table-view {
  .loading-state,
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
    
    p {
      margin: 0;
      font-style: italic;
    }
  }
  
  .tasks-table {
    width: 100%;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    thead {
      background: #f8f9fa;
      
      th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: #2c3e50;
        border-bottom: 2px solid #e0e0e0;
        position: relative;
        user-select: none;
        
        &.sortable-header {
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: #e8f4f8;
          }
        }
      }
    }
    
    .sort-indicator {
      margin-left: 0.5rem;
      font-size: 0.8rem;
      color: #42b883;
      font-weight: bold;
    }
    
    .resize-handle {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      cursor: col-resize;
      background: transparent;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: rgba(66, 184, 131, 0.3);
      }
      
      &:active {
        background-color: rgba(66, 184, 131, 0.5);
      }
    }
    
    tbody {
      tr {
        &:hover {
          background: #f8f9fa;
        }
        
        td {
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
          color: #2c3e50;
        }
        
        .task-title {
          cursor: pointer;
          color: #42b883;
          font-weight: 500;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
      
      &.status-todo {
        background: #fff3cd;
        color: #856404;
      }
      
      &.status-in-progress {
        background: #cce5ff;
        color: #004085;
      }
      
      &.status-done {
        background: #d4edda;
        color: #155724;
      }
    }
  }
}

.kanban-view {
  .kanban-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

.not-found {
  text-align: center;
  padding: 3rem;
  
  h2 {
    color: #e74c3c;
    margin: 0 0 1rem 0;
  }
  
  p {
    color: #666;
    margin: 0 0 2rem 0;
  }
}

// Delete confirmation modal styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 400px;
  width: 90%;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
  }
  
  p {
    margin: 0.5rem 0;
    color: #6b7280;
    
    &.warning {
      color: #ef4444;
      font-weight: 500;
    }
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
  }
  
  .cancel-btn {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    
    &:hover {
      background: #e5e7eb;
    }
  }
  
  .confirm-delete-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    
    &:hover {
      background: #dc2626;
    }
  }
}
</style>
