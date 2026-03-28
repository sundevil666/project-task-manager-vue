<template>
  <div class="project-detail">
    <div class="header">
      <button @click="goBack" class="back-button">← Назад</button>
      <div class="header-content">
        <h1>{{ project?.name }}</h1>
        <button @click="confirmDeleteProject" class="delete-button">🗑️ Видалити проєкт</button>
      </div>
    </div>
    
    <div v-if="project" class="project-content">
      <div class="controls">
        <div class="mode-switcher">
          <button 
            @click="setMode('table')" 
            :class="['mode-btn', { active: viewMode === 'table' }]"
          >
            Таблиця
          </button>
          <button 
            @click="setMode('kanban')" 
            :class="['mode-btn', { active: viewMode === 'kanban' }]"
          >
            Канбан
          </button>
        </div>
        <button @click="openCreateModal" class="add-task-btn">+ Додати задачу</button>
      </div>
      
      <div class="filters-section">
        <div class="filter-group">
          <label for="assignee-filter">Фільтр за виконавцем</label>
          <select
            id="assignee-filter"
            v-model="assigneeFilter"
            class="filter-select"
          >
            <option value="all">Усі</option>
            <option :value="null">Не призначено</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="status-filter">Статус:</label>
          <select 
            id="status-filter"
            v-model="statusFilter" 
            class="filter-select"
          >
            <option value="">Всі статуси</option>
            <option value="todo">До виконання</option>
            <option value="in-progress">В роботі</option>
            <option value="done">Завершено</option>
          </select>
        </div>
        <button 
          v-if="hasActiveFilters" 
          @click="clearFilters" 
          class="clear-filters-btn"
        >
          Очистити фільтри
        </button>
      </div>
      
      <div class="tasks-container">
        <div v-if="viewMode === 'table'" class="table-view">
          <div v-if="isLoading" class="loading-state">
            <p>Завантаження...</p>
          </div>
          <div v-else-if="projectTasks.length === 0" class="empty-state">
            <p>Немає задач</p>
          </div>
          <table v-else class="tasks-table">
            <thead>
              <tr>
                <th
                  @click="handleSort('id')"
                  class="sortable-header id-header"
                  :style="{ width: columnWidths.id + 'px' }"
                  data-column="id"
                >
                  ID завдання
                  <span class="sort-indicator" v-if="sort.column === 'id'">
                    {{ sort.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                  <div class="resize-handle" @mousedown="startResize($event, 'id')"></div>
                </th>
                <th 
                  @click="handleSort('title')" 
                  class="sortable-header"
                  :style="{ width: columnWidths.title + 'px' }"
                  data-column="title"
                >
                  Назва
                  <span class="sort-indicator" v-if="sort.column === 'title'">
                    {{ sort.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                  <div class="resize-handle" @mousedown="startResize($event, 'title')"></div>
                </th>
                <th 
                  @click="handleSort('assignee')" 
                  class="sortable-header"
                  :style="{ width: columnWidths.assignee + 'px' }"
                  data-column="assignee"
                >
                  Виконавець
                  <span class="sort-indicator" v-if="sort.column === 'assignee'">
                    {{ sort.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                  <div class="resize-handle" @mousedown="startResize($event, 'assignee')"></div>
                </th>
                <th 
                  @click="handleSort('status')" 
                  class="sortable-header"
                  :style="{ width: columnWidths.status + 'px' }"
                  data-column="status"
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
                  data-column="dueDate"
                >
                  Термін виконання
                  <span class="sort-indicator" v-if="sort.column === 'dueDate'">
                    {{ sort.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                  <div class="resize-handle" @mousedown="startResize($event, 'dueDate')"></div>
                </th>
                <th class="actions-header" :style="{ width: '80px' }">Дії</th>
              </tr>
              <tr v-if="sort.column === 'order'" class="manual-sort-indicator">
                <td class="manual-sort-notice"></td>
                <td :colspan="5" class="manual-sort-notice">
                  🔀 Ручне сортування (перетягніть задачі для зміни порядку)
                </td>
              </tr>
            </thead>
            <draggable 
              :model-value="displayTasks" 
              tag="tbody"
              item-key="id"
              :animation="200"
              ghost-class="ghost-row"
              chosen-class="chosen-row"
              drag-class="dragging-row"
              @end="handleTableReorder"
            >
              <template #item="{ element: task }">
                <tr :key="task.id" class="draggable-row">
                  <td :style="{ width: columnWidths.id + 'px' }" class="task-id">{{ task.id }}</td>
                  <td :style="{ width: columnWidths.title + 'px' }" @click="openEditModal(task)" class="task-title">{{ task.title }}</td>
                  <td :style="{ width: columnWidths.assignee + 'px' }">{{ getUserNameById(task.assignee) || '-' }}</td>
                  <td :style="{ width: columnWidths.status + 'px' }">
                    <span :class="['status-badge', `status-${task.status}`]">
                      {{ getStatusText(task.status) }}
                    </span>
                  </td>
                  <td :style="{ width: columnWidths.dueDate + 'px' }">{{ task.dueDate || '-' }}</td>
                  <td class="actions-cell" :style="{ width: '80px' }">
                    <button 
                      @click.stop="deleteTask(task.id)" 
                      class="delete-task-btn"
                      title="Видалити задачу"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </template>
            </draggable>
          </table>
        </div>
        
        <div v-else-if="viewMode === 'kanban'" class="kanban-view">
          <div class="kanban-columns">
            <KanbanColumn
              title="До виконання"
              :tasks="todoTasks"
              status="todo"
              :on-task-move="handleTaskMove"
              :on-task-reorder="handleTaskReorder"
              :on-edit-task="openEditModal"
              :on-delete-task="deleteTask"
            />
            <KanbanColumn
              title="В роботі"
              :tasks="inProgressTasks"
              status="in-progress"
              :on-task-move="handleTaskMove"
              :on-task-reorder="handleTaskReorder"
              :on-edit-task="openEditModal"
              :on-delete-task="deleteTask"
            />
            <KanbanColumn
              title="Завершено"
              :tasks="doneTasks"
              status="done"
              :on-task-move="handleTaskMove"
              :on-task-reorder="handleTaskReorder"
              :on-edit-task="openEditModal"
              :on-delete-task="deleteTask"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <h2>Проєкт не знайдено</h2>
      <p>Проєкт, який ви шукаєте, не існує.</p>
      <button @click="goBack" class="back-button">Повернутися до проєктів</button>
    </div>
    
    <TaskModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :task="selectedTask"
      :project-id="projectId"
      @close="closeModal"
    />
    
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="confirm-modal">
        <h3>Видалити проєкт?</h3>
        <p>Ви впевнені, що хочете видалити проєкт "{{ project?.name }}"?</p>
        <p class="warning">⚠️ Всі задачі в цьому проєкті також будуть видалені!</p>
        <div class="modal-actions">
          <button @click="cancelDeleteProject" class="cancel-btn">Скасувати</button>
          <button @click="deleteProject" class="confirm-delete-btn">Видалити</button>
        </div>
      </div>
    </div>
    
    <div v-if="showTaskDeleteConfirm" class="modal-overlay">
      <div class="confirm-modal">
        <h3>Видалити задачу?</h3>
        <p>Ви впевнені, що хочете видалити цю задачу?</p>
        <div class="modal-actions">
          <button @click="cancelDeleteTask" class="cancel-btn">Скасувати</button>
          <button @click="confirmDeleteTask" class="confirm-delete-btn">Видалити</button>
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
import type { Task } from '../store/tasks'
import { localStorageHelper, LS_KEYS } from '../utils/localStorage'
import type { TableSettings } from '../store/tasks'
import draggable from 'vuedraggable'
import { getUserNameById, mockUsers } from '../mocks/users'
import { handleError } from '../utils/errorHandler'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()
const projectsStore = useProjectsStore()

const viewMode = ref<'table' | 'kanban'>('table')

const initializeViewMode = () => {
  const savedMode = localStorageHelper.get<'table' | 'kanban'>(LS_KEYS.VIEW_MODE)
  if (savedMode) {
    viewMode.value = savedMode
  }
}

const saveViewMode = () => {
  localStorageHelper.set(LS_KEYS.VIEW_MODE, viewMode.value)
}

onMounted(async () => {
  initializeViewMode()
  
  // Load table settings (sort, filters, column widths) from LocalStorage via store
  taskStore.loadTableSettings()
  
  // Sync local filter refs with loaded store values
  const loadedFilters = taskStore.filters
  if (loadedFilters.status) {
    statusFilter.value = loadedFilters.status
  }
  if (loadedFilters.assignee !== undefined) {
    assigneeFilter.value = loadedFilters.assignee
  }
  
  await projectsStore.fetchProjects()
  await taskStore.fetchTasks(projectId.value)
})

watch(viewMode, saveViewMode)

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedTask = ref<Task | undefined>()

const showDeleteConfirm = ref(false)
const showTaskDeleteConfirm = ref(false)
const taskToDelete = ref<number | null>(null)

const handleTableReorder = async (event: any) => {
  const { oldIndex, newIndex } = event
  
  if (oldIndex !== newIndex) {
    const currentTasks = [...displayTasks.value]
    const draggedTask = currentTasks[oldIndex]
    
    const reorderedTasks = [...currentTasks]
    reorderedTasks.splice(oldIndex, 1)
    reorderedTasks.splice(newIndex, 0, draggedTask)
    
    const allProjectTasks = taskStore.getTasksByProjectId(projectId.value)
    const otherProjectTasks = allProjectTasks.filter(task => 
      !reorderedTasks.some(updated => updated.id === task.id)
    )
    
    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      order: index
    }))
    
    const finalTasks = [...otherProjectTasks, ...updatedTasks]
    
    taskStore.setSort({ column: 'order', direction: 'asc' })
    
    await taskStore.reorderTasks(finalTasks)
  }
}

const columnWidths = computed({
  get: () => taskStore.tableSettings.columnWidths,
  set: (value) => {
    taskStore.saveTableSettings(value)
  }
})

const resizing = ref(false)
const resizingColumn = ref<keyof typeof taskStore.tableSettings.columnWidths | null>(null)
const startX = ref(0)
const startWidth = ref(0)

const setMode = (mode: 'table' | 'kanban') => {
  viewMode.value = mode
}

const project = computed(() => {
  const projectId = Number(route.params.id)
  return projectsStore.getProjectById(projectId)
})

const projectId = computed(() => Number(route.params.id))
const projectTasks = computed(() => taskStore.getTasksByProjectId(projectId.value))
const isLoading = computed(() => taskStore.loading)
const sort = computed(() => taskStore.sort)

const todoTasks = computed(() => {
  return displayTasks.value.filter((task: Task) => task.status === 'todo')
})
const inProgressTasks = computed(() => {
  return displayTasks.value.filter((task: Task) => task.status === 'in-progress')
})
const doneTasks = computed(() => {
  return displayTasks.value.filter((task: Task) => task.status === 'done')
})

const users = mockUsers

const assigneeFilter = ref<number | null | 'all'>('all')
const statusFilter = ref('')

const displayTasks = computed(() => {
  return taskStore.getFilteredAndSortedTasks(projectId.value)
})

const hasActiveFilters = computed(() => {
  return assigneeFilter.value !== 'all' || statusFilter.value !== ''
})

watch([assigneeFilter, statusFilter], ([newAssignee, newStatus]) => {
  taskStore.setFilters({
    assignee: newAssignee,
    status: newStatus as any || undefined
  })
})

const handleSort = (column: 'status' | 'dueDate' | 'title' | 'assignee') => {
  taskStore.toggleSort(column)
}

const clearFilters = () => {
  assigneeFilter.value = 'all'
  statusFilter.value = ''
  taskStore.clearFilters()
}

const startResize = (event: MouseEvent, column: keyof typeof columnWidths.value) => {
  event.preventDefault()
  resizing.value = true
  resizingColumn.value = column
  startX.value = event.clientX
  startWidth.value = columnWidths.value[column]
  currentResizeWidth.value = startWidth.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!resizing.value || !resizingColumn.value) return
  
  const diff = event.clientX - startX.value
  const newWidth = Math.max(80, startWidth.value + diff)
  
  // Применяем ширину напрямую к DOM для производительности
  const th = document.querySelector(`th[data-column="${resizingColumn.value}"]`)
  if (th) {
    (th as HTMLElement).style.width = newWidth + 'px'
  }
  
  // Обновляем текущую ширину для сохранения
  currentResizeWidth.value = newWidth
}

const currentResizeWidth = ref(0)

const stopResize = () => {
  if (resizing.value && resizingColumn.value) {
    // Создаем новый объект с обновленной шириной
    const newWidths = {
      ...columnWidths.value,
      [resizingColumn.value]: currentResizeWidth.value
    }
    taskStore.saveTableSettings(newWidths)
  }
  
  resizing.value = false
  resizingColumn.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const goBack = () => {
  router.push('/')
}

watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await taskStore.fetchTasks(Number(newId))
  }
}, { immediate: false })

const getStatusText = (status: string) => {
  switch (status) {
    case 'todo': return 'До виконання'
    case 'in-progress': return 'В роботі'
    case 'done': return 'Завершено'
    default: return status
  }
}

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

const deleteTask = (taskId: number) => {
  taskToDelete.value = taskId
  showTaskDeleteConfirm.value = true
}

const confirmDeleteTask = async () => {
  if (!taskToDelete.value) return
  
  try {
    await taskStore.deleteTask(taskToDelete.value)
  } catch (error) {
    handleError(error, { message: 'Помилка при видаленні задачі' })
  } finally {
    taskToDelete.value = null
    showTaskDeleteConfirm.value = false
  }
}

const cancelDeleteTask = () => {
  taskToDelete.value = null
  showTaskDeleteConfirm.value = false
}

const confirmDeleteProject = () => {
  showDeleteConfirm.value = true
}

const cancelDeleteProject = () => {
  showDeleteConfirm.value = false
}

const deleteProject = async () => {
  if (!project.value) return
  
  try {
    await taskStore.deleteTasksByProjectId(project.value.id)
    
    await projectsStore.deleteProject(project.value.id)
    
    router.push('/')
  } catch (error) {
    handleError(error, { message: 'Помилка при видаленні проєкту' })
  }
}

const handleTaskMove = async (taskId: number, newStatus: Task['status'], newOrder: number) => {
  try {
    await taskStore.updateTask(taskId, { status: newStatus })
    
    taskStore.setSort({ column: 'order', direction: 'asc' })
    
    const allProjectTasks = taskStore.getTasksByProjectId(projectId.value)
    
    const statusGroups = {
      'todo': allProjectTasks.filter(t => t.status === 'todo'),
      'in-progress': allProjectTasks.filter(t => t.status === 'in-progress'),
      'done': allProjectTasks.filter(t => t.status === 'done')
    }
    
    const reorderedTasks: Task[] = []
    
    const insertTaskAtPosition = (tasks: Task[], insertOrder: number) => {
      const movedTask = tasks.find(t => t.id === taskId)
      if (!movedTask) return tasks
      
      const newTasks = tasks.filter(t => t.id !== taskId)
      newTasks.splice(insertOrder, 0, movedTask)
      return newTasks
    }
    
    const targetTasks = statusGroups[newStatus]
    const reorderedTargetTasks = insertTaskAtPosition(targetTasks, newOrder)
    
    const allStatuses: Task['status'][] = ['todo', 'in-progress', 'done']
    allStatuses.forEach(status => {
      const statusTasks = status === newStatus 
        ? reorderedTargetTasks
        : statusGroups[status]
      
      statusTasks.forEach((task, index) => {
        reorderedTasks.push({ ...task, order: index })
      })
    })
    
    await taskStore.reorderTasks(reorderedTasks)
  } catch (error) {
    handleError(error, { message: 'Помилка при переміщенні задачі' })
  }
}

const handleTaskReorder = async (taskId: number, newOrder: number) => {
  try {
    const allProjectTasks = taskStore.getTasksByProjectId(projectId.value)
    
    const statusGroups = {
      'todo': allProjectTasks.filter(t => t.status === 'todo'),
      'in-progress': allProjectTasks.filter(t => t.status === 'in-progress'),
      'done': allProjectTasks.filter(t => t.status === 'done')
    }
    
    const reorderedTasks: Task[] = []
    
    let taskStatus: Task['status'] | null = null
    for (const [status, tasks] of Object.entries(statusGroups)) {
      if (tasks.some(t => t.id === taskId)) {
        taskStatus = status as Task['status']
        break
      }
    }
    
    if (!taskStatus) return
    
    const statusTasks = statusGroups[taskStatus]
    const movedTask = statusTasks.find(t => t.id === taskId)
    if (!movedTask) return
    
    const newTasks = [...statusTasks]
    const currentIndex = newTasks.findIndex(t => t.id === taskId)
    
    newTasks.splice(currentIndex, 1)
    newTasks.splice(newOrder, 0, movedTask)
    
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
    handleError(error, { message: 'Помилка при зміні порядку задач' })
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
  overflow: auto;
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
      
      .manual-sort-indicator {
        background: #e8f5e8;
        
        .manual-sort-notice {
          padding: 0.5rem 1rem;
          text-align: center;
          font-size: 0.85rem;
          color: #2d5a2d;
          font-weight: 500;
          border-bottom: 1px solid #d4edda;
        }
      }
      
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
        
        .task-id {
          text-align: center;
          font-weight: 600;
          color: #666;
          font-size: 0.9rem;
        }
      }
      
      .draggable-row {
        cursor: grab;
        transition: all 0.2s ease;
        
        &:hover {
          background: #f0f8f0;
        }
        
        &:active {
          cursor: grabbing;
        }
      }
      
      .ghost-row {
        opacity: 0.5;
        background: #e8f4f8 !important;
        border: 2px dashed #42b883;
      }
      
      .chosen-row {
        background: #d4edda !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: scale(1.02);
      }
      
      .dragging-row {
        background: #42b883 !important;
        color: white;
        opacity: 0.9;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        
        .task-title {
          color: white;
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
    
    .actions-cell {
      text-align: center;
    }
    
    .delete-task-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #fee2e2;
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
