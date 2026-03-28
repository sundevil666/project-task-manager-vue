<template>
  <div class="task-status-chart">
    <h3 class="chart-title">Розподіл задач за статусами</h3>
    <div class="chart-wrapper">
      <Doughnut v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="no-data">Немає даних</div>
    </div>
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color" style="background-color: #f59e0b;"></span>
        <span class="legend-label">До виконання: {{ statusCounts.todo }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #3b82f6;"></span>
        <span class="legend-label">В роботі: {{ statusCounts['in-progress'] }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #10b981;"></span>
        <span class="legend-label">Завершено: {{ statusCounts.done }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useTaskStore } from '../store/tasks'
import { storeToRefs } from 'pinia'

ChartJS.register(ArcElement, Tooltip, Legend)

const taskStore = useTaskStore()
const { tasks } = storeToRefs(taskStore)

const statusCounts = computed(() => {
  const counts = {
    todo: 0,
    'in-progress': 0,
    done: 0
  }

  tasks.value.forEach(task => {
    if (counts[task.status] !== undefined) {
      counts[task.status]++
    }
  })

  return counts
})

const chartData = computed(() => ({
  labels: ['До виконання', 'В роботі', 'Завершено'],
  datasets: [
    {
      data: [statusCounts.value.todo, statusCounts.value['in-progress'], statusCounts.value.done],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
      borderColor: ['#ffffff', '#ffffff', '#ffffff'],
      borderWidth: 2
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: { label?: string; parsed: number; dataset: { data: number[] } }) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.task-status-chart {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  text-align: center;
}

.chart-wrapper {
  height: 200px;
  position: relative;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 0.875rem;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  font-weight: 500;
}
</style>
