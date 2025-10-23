<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { useApiFetch } from '@/composables/useApiFetch'

Chart.register(...registerables)

const { apiFetch } = useApiFetch()
const eloData = ref<{x: string, y: number}[]>([])
let eloChart: Chart | null = null

const fetchStudentAnalytics = async () => {
  try {
    const res = await apiFetch('/student/me/analytics')
    const attempts = res.challenge_attempts || []

    // Build cumulative ELO over time
    let cumulativeElo = 0
    eloData.value = attempts
        .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
        .map(a => {
          cumulativeElo += a.elo_delta ?? 0
          return { x: a.submitted_at, y: cumulativeElo }
        })
  } catch (err) {
    console.error('Failed to fetch student analytics:', err)
  }
}

const renderEloChart = () => {
  const ctx = document.getElementById('eloChart') as HTMLCanvasElement
  if (!ctx) return
  if (eloChart) eloChart.destroy()

  eloChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'ELO Over Time',
          data: eloData.value,
          borderColor: 'rgb(192 132 252)',
          fill: true,
          borderWidth: 4,
          pointBackgroundColor: 'rgb(192 132 252)',
          pointHoverBackgroundColor: 'rgb(147 51 234)',
          pointHoverRadius: 6,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 1500, easing: 'easeOutQuart' },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd' },
          title: { display: true, text: 'Date' },
        },
        y: {
          beginAtZero: false,
          title: { display: true, text: 'ELO' },
        },
      },
      plugins: {
        title: { display: true, text: 'ELO Distribution Over Time', font: { size: 16 } },
        legend: { display: true },
      },
    },
  })
}

onMounted(async () => {
  await fetchStudentAnalytics()
  nextTick(() => renderEloChart())
})
</script>

<template>
  <div class="overflow-x-auto w-full">
    <canvas id="eloChart" class="w-full h-96 sm:h-[32rem]"></canvas>
  </div>
</template>