<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useApiFetch } from '@/composables/useApiFetch'

Chart.register(...registerables)

const { apiFetch } = useApiFetch()
const analyticsData = ref<any>(null)
let lineChart: Chart | null = null

const fetchAnalytics = async () => {
  try {
    analyticsData.value = await apiFetch('/student/me/analytics')
  } catch (err) {
    console.error('Failed to fetch student analytics:', err)
  } finally {
    nextTick(() => renderChart())
  }
}

const renderChart = () => {
  const ctx = document.getElementById('attemptsOverTimeChart') as HTMLCanvasElement
  if (!ctx || !analyticsData.value) return

  // Last 20 submissions
  const recentSubmissions = analyticsData.value.recent_submissions.slice(-20)

  const labels = recentSubmissions.map((r: any) =>
      new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  )

  const data = recentSubmissions.map((r: any) => {
    switch (r.status_id) {
      case 3: return { y: 3, backgroundColor: 'rgb(34 197 94)' } // pass - green
      case 2: return { y: 2, backgroundColor: 'rgb(251 191 36)' } // partial - yellow
      default: return { y: 1, backgroundColor: 'rgb(220 38 38)' } // fail - red
    }
  })

  const yValues = data.map(d => d.y)
  const pointColors = data.map(d => d.backgroundColor)

  if (lineChart) lineChart.destroy()

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Attempts Over Time',
          data: yValues,
          fill: false,
          borderColor: 'rgb(192 132 252)',
          tension: 0.3,
          pointBackgroundColor: pointColors,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Attempts Over Time' },
      },
      scales: {
        y: {
          ticks: {
            stepSize: 1,
            callback: (value) => {
              if (value === 1) return 'Fail'
              if (value === 2) return 'Partial'
              if (value === 3) return 'Pass'
              return value
            },
          },
        },
        x: {
          ticks: { maxRotation: 45, minRotation: 0 },
        },
      },
    },
  })
}

onMounted(fetchAnalytics)
</script>

<template>
  <div class="w-full">
    <div class="w-full h-96 sm:h-[32rem] flex justify-center items-center">
      <canvas id="attemptsOverTimeChart" class="max-w-full max-h-full"></canvas>
    </div>
  </div>
</template>