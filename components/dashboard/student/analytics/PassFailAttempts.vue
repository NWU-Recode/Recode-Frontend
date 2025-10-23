<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useApiFetch } from '@/composables/useApiFetch'

Chart.register(...registerables)

const { apiFetch } = useApiFetch()

const analyticsData = ref<any>(null)
let stackedChart: Chart | null = null

// Fetch analytics
const fetchAnalytics = async () => {
  try {
    analyticsData.value = await apiFetch('/student/me/analytics')
  } catch (err) {
    console.error('Failed to fetch student analytics:', err)
  } finally {
    nextTick(() => renderChart())
  }
}

// Render stacked bar chart
const renderChart = () => {
  const ctx = document.getElementById('passFailChart') as HTMLCanvasElement
  if (!ctx || !analyticsData.value) return

  // Prepare last 10 attempts
  const recentAttempts = analyticsData.value.recent
      .slice(-10) // last 10 attempts
      .map((r: any, idx: number) => ({
        attempt: idx + 1,
        passed: r.additional_files.tests_passed === r.additional_files.tests_total ? 1 : 0,
        failed: r.additional_files.tests_passed < r.additional_files.tests_total ? 1 : 0,
      }))

  const labels = recentAttempts.map((r: any) => `Attempt ${r.attempt}`)
  const passedData = recentAttempts.map((r: any) => r.passed)
  const failedData = recentAttempts.map((r: any) => r.failed)

  if (stackedChart) stackedChart.destroy()

  stackedChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Passed',
          data: passedData,
          backgroundColor: 'rgb(34 197 94)', // green
        },
        {
          label: 'Failed',
          data: failedData,
          backgroundColor: 'rgb(220 38 38)', // red
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Recent Pass vs Fail Attempts' },
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  })
}

onMounted(() => fetchAnalytics())
</script>

<template>
  <div class="w-full">
    <div class="w-full h-150 sm:h-[32rem] relative">
      <canvas id="passFailChart" class="w-full h-full"></canvas>
    </div>
  </div>
</template>