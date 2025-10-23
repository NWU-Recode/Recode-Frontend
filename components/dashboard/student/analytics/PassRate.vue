<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useApiFetch } from '@/composables/useApiFetch'

Chart.register(...registerables)

const { apiFetch } = useApiFetch()
const analyticsData = ref<any[]>([])
let passRateChart: Chart | null = null

const fetchAnalytics = async () => {
  try {
    const data = await apiFetch('/student/me/analytics')
    analyticsData.value = data.recent || []
  } catch (err) {
    console.error('Failed to fetch analytics:', err)
  }
}

const renderChart = () => {
  const ctx = document.getElementById('passRateChart') as HTMLCanvasElement
  if (!ctx || !analyticsData.value.length) return
  if (passRateChart) passRateChart.destroy()

  const totalAttempts = analyticsData.value.length
  const totalPassed = analyticsData.value.filter(
      a => a.additional_files.tests_passed === a.additional_files.tests_total
  ).length
  const totalFailed = totalAttempts - totalPassed
  const passPercentage = ((totalPassed / totalAttempts) * 100).toFixed(1)

  passRateChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Passed', 'Failed'],
      datasets: [
        {
          data: [totalPassed, totalFailed],
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