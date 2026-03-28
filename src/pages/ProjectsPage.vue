<template>
  <div class="projects-page">
    <div class="projects-header">
      <h1>Проєкти</h1>
      <button class="btn btn--primary" @click="openModal">Додати проєкт</button>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <input
          v-model="filterName"
          type="text"
          placeholder="Пошук за назвою..."
          class="filter-input"
        />
      </div>
      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="">Всі статуси</option>
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>
    </div>

    <div class="dashboard">
      <TaskStatusChart class="chart-section" />
      <div class="projects-table-container">
        <div v-if="isLoading" class="loading-state">
          Завантаження...
        </div>
        <table v-else class="projects-table">
          <thead>
            <tr>
              <th
                class="sortable-header"
                :class="{ 'sort-asc': sortColumn === 'id' && sortDirection === 'asc', 'sort-desc': sortColumn === 'id' && sortDirection === 'desc' }"
                :style="{ width: columnWidths.id + 'px' }"
                @click="toggleSort('id')"
              >
                ID проєкту
                <span class="sort-icon">↕</span>
                <div class="resize-handle" @mousedown="startResize($event, 'id')"></div>
              </th>
              <th
                class="sortable-header"
                :class="{ 'sort-asc': sortColumn === 'name' && sortDirection === 'asc', 'sort-desc': sortColumn === 'name' && sortDirection === 'desc' }"
                :style="{ width: columnWidths.name + 'px' }"
                @click="toggleSort('name')"
              >
                Назва проєкту
                <span class="sort-icon">↕</span>
                <div class="resize-handle" @mousedown="startResize($event, 'name')"></div>
              </th>
              <th
                class="sortable-header"
                :class="{ 'sort-asc': sortColumn === 'taskCount' && sortDirection === 'asc', 'sort-desc': sortColumn === 'taskCount' && sortDirection === 'desc' }"
                :style="{ width: columnWidths.taskCount + 'px' }"
                @click="toggleSort('taskCount')"
              >
                Кількість задач
                <span class="sort-icon">↕</span>
                <div class="resize-handle" @mousedown="startResize($event, 'taskCount')"></div>
              </th>
              <th
                class="sortable-header"
                :class="{ 'sort-asc': sortColumn === 'status' && sortDirection === 'asc', 'sort-desc': sortColumn === 'status' && sortDirection === 'desc' }"
                :style="{ width: columnWidths.status + 'px' }"
                @click="toggleSort('status')"
              >
                Статус
                <span class="sort-icon">↕</span>
                <div class="resize-handle" @mousedown="startResize($event, 'status')"></div>
              </th>
              <th :style="{ width: columnWidths.createdAt + 'px' }">Дата створення
                <div class="resize-handle" @mousedown="startResize($event, 'createdAt')"></div>
              </th>
              <th :style="{ width: columnWidths.actions + 'px' }">Дії
                <div class="resize-handle" @mousedown="startResize($event, 'actions')"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            <ProjectRow
              v-for="project in filteredAndSortedProjects"
              :key="project.id"
              :project="project"
              :widths="columnWidths"
              @edit="openEditModal"
            />
          </tbody>
        </table>
        <div v-if="filteredAndSortedProjects.length === 0 && !isLoading" class="empty-state">
          Проєкти не знайдено
        </div>
      </div>
    </div>

    <AddProjectModal
      :is-open="isModalOpen"
      :project="editingProject"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ProjectRow from '../components/ProjectRow.vue'
import AddProjectModal from '../components/AddProjectModal.vue'
import TaskStatusChart from '../components/TaskStatusChart.vue'
import { useProjectsStore } from '../store/projects'
import { useTaskStore } from '../store/tasks'
import { useAppStore } from '../store/index'
import { localStorageHelper, LS_KEYS } from '../utils/localStorage'
import type { IProject } from '../mocks/projects'

type SortColumn = 'id' | 'name' | 'taskCount' | 'status'
type SortDirection = 'asc' | 'desc'

interface TableSettings {
  sortColumn: SortColumn
  sortDirection: SortDirection
  filterName: string
  filterStatus: string
  columnWidths?: {
    id: number
    name: number
    taskCount: number
    status: number
    createdAt: number
    actions: number
  }
}

const projectsStore = useProjectsStore()
const taskStore = useTaskStore()
const appStore = useAppStore()

const { getAllProjects: projects } = storeToRefs(projectsStore)
const { isLoading } = storeToRefs(appStore)

const isModalOpen = ref(false)
const editingProject = ref<IProject | null>(null)

const sortColumn = ref<SortColumn>('id')
const sortDirection = ref<SortDirection>('asc')
const filterName = ref('')
const filterStatus = ref('')

const columnWidths = ref({
  id: 80,
  name: 250,
  taskCount: 120,
  status: 120,
  createdAt: 120,
  actions: 100
})

const resizing = ref(false)
const resizingColumn = ref<keyof typeof columnWidths.value | null>(null)
const startX = ref(0)
const startWidth = ref(0)

const startResize = (event: MouseEvent, column: keyof typeof columnWidths.value) => {
  event.preventDefault()
  event.stopPropagation()
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
  const newWidth = Math.max(60, startWidth.value + diff)
  columnWidths.value[resizingColumn.value] = newWidth
}

const stopResize = () => {
  if (resizing.value && resizingColumn.value) {
    saveTableSettings()
  }

  resizing.value = false
  resizingColumn.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const loadTableSettings = () => {
  const settings = localStorageHelper.get<TableSettings>(LS_KEYS.PROJECTS_TABLE_SETTINGS)
  if (settings) {
    sortColumn.value = settings.sortColumn ?? 'id'
    sortDirection.value = settings.sortDirection ?? 'asc'
    filterName.value = settings.filterName ?? ''
    filterStatus.value = settings.filterStatus ?? ''
    if (settings.columnWidths) {
      columnWidths.value = { ...columnWidths.value, ...settings.columnWidths }
    }
  }
}

const saveTableSettings = () => {
  const settings: TableSettings = {
    sortColumn: sortColumn.value,
    sortDirection: sortDirection.value,
    filterName: filterName.value,
    filterStatus: filterStatus.value,
    columnWidths: columnWidths.value
  }
  localStorageHelper.set(LS_KEYS.PROJECTS_TABLE_SETTINGS, settings)
}

watch([sortColumn, sortDirection, filterName, filterStatus, columnWidths], saveTableSettings, { deep: true })

onMounted(async () => {
  loadTableSettings()
  await Promise.all([
    projectsStore.fetchProjects(),
    taskStore.fetchTasks()
  ])
})

const toggleSort = (column: SortColumn) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const filteredProjects = computed(() => {
  let result = projects.value || []

  if (filterName.value.trim()) {
    const searchTerm = filterName.value.toLowerCase().trim()
    result = result.filter(project =>
      project.name.toLowerCase().includes(searchTerm)
    )
  }

  if (filterStatus.value) {
    result = result.filter(project => project.status === filterStatus.value)
  }

  return result
})

const filteredAndSortedProjects = computed(() => {
  const result = [...filteredProjects.value]

  result.sort((a: IProject, b: IProject) => {
    let comparison = 0

    switch (sortColumn.value) {
      case 'id':
        comparison = a.id - b.id
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'taskCount':
        comparison = a.taskCount - b.taskCount
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }

    return sortDirection.value === 'asc' ? comparison : -comparison
  })

  return result
})

const openModal = () => {
  editingProject.value = null
  isModalOpen.value = true
}

const openEditModal = (project: IProject) => {
  editingProject.value = project
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingProject.value = null
}
</script>

<style scoped lang="scss">
.loading-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

.projects-page {
  padding: 2rem;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-input,
.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  color: #1f2937;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
}

.filter-input {
  &::placeholder {
    color: #9ca3af;
  }
}

.dashboard {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.chart-section {
  @media (max-width: 1024px) {
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }
}

.projects-table-container {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;

  th {
    background-color: #f9fafb;
    font-weight: 600;
    text-align: left;
    padding: 1rem;
    border-bottom: 2px solid #e5e7eb;
    color: #1f2937;
    position: relative;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f9fafb;
    }
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  position: relative;

  &:hover {
    background-color: #e5e7eb;
  }

  .sort-icon {
    margin-left: 0.5rem;
    opacity: 0.5;
    font-size: 0.75rem;
  }

  &.sort-asc,
  &.sort-desc {
    background-color: #e0e7ff;

    .sort-icon {
      opacity: 1;
      color: #3b82f6;
    }
  }

  &.sort-asc .sort-icon::after {
    content: '↑';
  }

  &.sort-desc .sort-icon::after {
    content: '↓';
  }
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
    background-color: #3b82f6;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;

  &--primary {
    background-color: #3b82f6;
    color: white;

    &:hover {
      background-color: #2563eb;
    }
  }
}
</style>
