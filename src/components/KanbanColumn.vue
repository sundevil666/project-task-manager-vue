<template>
  <div class="kanban-column" :data-status="status">
    <div class="column-header">
      <h3>{{ title }}</h3>
      <span class="task-count">{{ tasks.length }}</span>
    </div>
    
    <draggable
      :model-value="tasks"
      :group="{ name: 'tasks' }"
      :animation="200"
      ghost-class="ghost-card"
      chosen-class="chosen-card"
      drag-class="drag-card"
      item-key="id"
      @end="handleDragEnd"
      class="tasks-list"
    >
      <template #item="{ element: task }">
        <div class="task-card" :data-id="task.id">
          <div class="task-header">
            <div class="task-title" @click="openEditModal(task)">{{ task.title }}</div>
            <button 
              @click.stop="handleDelete(task.id)" 
              class="delete-task-btn"
              title="Видалити задачу"
            >
              🗑️
            </button>
          </div>
          <div class="task-meta">
            <div v-if="task.assignee" class="task-assignee">
              <span class="assignee-icon">👤</span>
              {{ getAssigneeName(task.assignee) }}
            </div>
            <div v-if="task.dueDate" class="task-due-date">
              <span class="date-icon">📅</span>
              {{ formatDate(task.dueDate) }}
            </div>
          </div>
        </div>
      </template>
    </draggable>
    
    <div v-if="tasks.length === 0" class="empty-column">
      <p>Немає задач</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { Task } from '../store/tasks'
import { getUserNameById } from '../mocks/users'

const getAssigneeName = (assigneeId: number | undefined): string => {
  return getUserNameById(assigneeId) || 'Не призначено'
}

interface Props {
  title: string
  tasks: Task[]
  status: Task['status']
  onTaskMove: (taskId: number, newStatus: Task['status'], newOrder: number) => void
  onTaskReorder: (taskId: number, newOrder: number) => void
  onEditTask: (task: Task) => void
  onDeleteTask?: (taskId: number) => void
}

const props = defineProps<Props>()

const handleDragEnd = (event: { item: HTMLElement; from: HTMLElement; to: HTMLElement; oldIndex: number; newIndex: number }): void => {
  const { item, from, to, oldIndex, newIndex } = event
  
  if (oldIndex === newIndex && from === to) {
    return
  }
  
  const taskId = parseInt(item.dataset.id)
  
  const toColumn = to.closest('.kanban-column')
  if (!toColumn) return
  
  const newStatus = toColumn.dataset.status as Task['status']
  
  if (newStatus !== props.status) {
    props.onTaskMove(taskId, newStatus, newIndex)
  } else {
    props.onTaskReorder(taskId, newIndex)
  }
}

const openEditModal = (task: Task): void => {
  props.onEditTask(task)
}

const handleDelete = (taskId: number): void => {
  if (props.onDeleteTask) {
    props.onDeleteTask(taskId)
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.kanban-column {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  
  &[data-status="todo"] {
    border-color: #fbbf24;
  }
  
  &[data-status="in-progress"] {
    border-color: #60a5fa;
  }
  
  &[data-status="done"] {
    border-color: #34d399;
  }
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .task-count {
    background: #f3f4f6;
    color: #6b7280;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }
}

.tasks-list {
  flex: 1;
  min-height: 200px;
}

.task-card {
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.task-title {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.875rem;
  line-height: 1.3;
  flex: 1;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.delete-task-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.125rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background-color: #fee2e2;
  }
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.task-assignee,
.task-due-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.assignee-icon,
.date-icon {
  font-size: 0.7rem;
}

.empty-column {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}

.ghost-card {
  opacity: 0.5;
  background: #e5e7eb;
  border: 2px dashed #42b883;
}

.chosen-card {
  cursor: grabbing;
  transform: rotate(5deg);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.drag-card {
  opacity: 0.9;
  transform: rotate(2deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .kanban-column {
    min-height: 300px;
  }
  
  .task-card {
    padding: 0.5rem;
  }
  
  .task-title {
    font-size: 0.8rem;
  }
}
</style>
