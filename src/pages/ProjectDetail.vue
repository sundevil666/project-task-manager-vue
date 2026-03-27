<template>
  <div class="project-detail">
    <div class="header">
      <button @click="goBack" class="back-button">← Назад</button>
      <h1>{{ project?.name }}</h1>
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
        <button class="add-task-btn">+ Добавить задачу</button>
      </div>
      
      <div class="tasks-container">
        <div v-if="viewMode === 'table'" class="table-view">
          <div class="table-placeholder">
            <h3>Таблица задач</h3>
            <p>Здесь будет отображаться таблица с задачами</p>
          </div>
        </div>
        
        <div v-else-if="viewMode === 'kanban'" class="kanban-view">
          <div class="kanban-columns">
            <div class="kanban-column">
              <h3>To Do</h3>
              <div class="column-placeholder">
                <p>Задачи для выполнения</p>
              </div>
            </div>
            <div class="kanban-column">
              <h3>In Progress</h3>
              <div class="column-placeholder">
                <p>Задачи в работе</p>
              </div>
            </div>
            <div class="kanban-column">
              <h3>Done</h3>
              <div class="column-placeholder">
                <p>Завершенные задачи</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <h2>Проект не найден</h2>
      <p>Проект, который вы ищете, не существует.</p>
      <button @click="goBack" class="back-button">Вернуться к проектам</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockProjects } from '../mocks/projects'
import type { IProject } from '../types'

const router = useRouter()
const route = useRoute()

const viewMode = ref<'table' | 'kanban'>('table')

const setMode = (mode: 'table' | 'kanban') => {
  viewMode.value = mode
}

const project = computed((): IProject | null => {
  const projectId = Number(route.params.id)
  const project = mockProjects.find(p => p.id === projectId)
  
  if (project) {
    return {
      ...project,
    }
  }
  
  return null
})

const goBack = () => {
  router.push('/')
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

.tasks-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 400px;
}

.table-view {
  .table-placeholder {
    text-align: center;
    padding: 3rem;
    color: #666;
    
    h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
    }
    
    p {
      margin: 0;
      font-style: italic;
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
  
  .kanban-column {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    
    h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.1rem;
      text-align: center;
    }
    
    .column-placeholder {
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      p {
        color: #999;
        font-style: italic;
        text-align: center;
      }
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
</style>
