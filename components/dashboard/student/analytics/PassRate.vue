<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useApiFetch } from '@/composables/useApiFetch'

Chart.register(...registerables)

const { apiFetch } = useApiFetch()
const analytics = ref<{ total_attempts: number; total_passed: number; total_failed: number }>({
  total_attempts: 0,
  total_passed: 0,
  total_failed: 0,
})
let passRateChart: Chart | null = null

const fetchAnalytics = async () => {
  try {
    const data = await apiFetch('/student/me/analytics')
    analytics.value = {
      total_attempts: data.total_attempts,
      total_passed: data.total_passed,
      total_failed: data.total_failed,
    }
  } catch (err) {
    console.error('Failed to fetch analytics:', err)
  }
}

const renderChart = () => {
  const ctx = document.getElementById('passRateChart') as HTMLCanvasElement
  if (!ctx || analytics.value.total_attempts === 0) return
  if (passRateChart) passRateChart.destroy()

  const { total_passed, total_failed, total_attempts } = analytics.value
  const passPercentage = ((total_passed / total_attempts) * 100).toFixed(1)

  passRateChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Passed', 'Failed'],
      datasets: [
        {
          data: [total_passed, total_failed],
          backgroundColor: ['rgb(34 197 94)', 'rgb(220 38 38)'],
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Pass Rate: ${passPercentage}%`,
          font: { size: 16 },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    },
  })
}

onMounted(async () => {
  await fetchAnalytics()
  nextTick(renderChart)
})
</script>

<template>
  <div class="w-full">
    <div class="w-full h-96 sm:h-[32rem] flex justify-center items-center">
      <canvas id="passRateChart" class="w-full h-full"></canvas>
    </div>
  </div>
</template>