<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { useApiFetch } from '@/composables/useApiFetch'

Chart.register(...registerables)

const { apiFetch } = useApiFetch()
const eloData = ref<any[]>([])
let eloChart: Chart | null = null

const fetchWeeklyElo = async () => {
  try {
    eloData.value = await apiFetch('/analytics/distribution/weekly')
  } catch (err) {
    console.error('Failed to fetch weekly ELO:', err)
  }
}

const renderEloChart = () => {
  const ctx = document.getElementById('eloChart') as HTMLCanvasElement
  if (!ctx) return
  if (eloChart) eloChart.destroy()

  const chartData = eloData.value
      .map(d => ({
        x: d.week_start,
        y: d.latest_elo,
      }))
      .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())

  eloChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Latest ELO',
          data: chartData,
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
      animation: {
        duration: 1500,
        easing: 'easeOutQuart',
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'week', tooltipFormat: 'yyyy-MM-dd' },
          title: { display: true, text: 'Week' },
        },
        y: {
          beginAtZero: false,
          title: { display: true, text: 'ELO' },
        },
      },
      plugins: {
        title: {
          display: true,
          text: 'ELO Distribution Over Time',
          font: { size: 16 },
        },
        legend: { display: true },
      },
    },
  })
}

onMounted(async () => {
  await fetchWeeklyElo()
  nextTick(() => renderEloChart())
})
</script>

<template>
  <div class="overflow-x-auto w-full">
    <canvas id="eloChart" class="w-full h-96 sm:h-[32rem]"></canvas>
  </div>
</template>