<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { useApiFetch } from '@/composables/useApiFetch'

Chart.register(...registerables)

const { apiFetch } = useApiFetch()
const analyticsData = ref<any[]>([])
let stackedAreaChart: Chart | null = null

// Fetch student submissions
const fetchAnalytics = async () => {
  try {
    const data = await apiFetch('/student/me/analytics')
    analyticsData.value = data.recent || []
  } catch (err) {
    console.error('Failed to fetch analytics:', err)
  }
}

const renderChart = () => {
  const ctx = document.getElementById('cumulativeChart') as HTMLCanvasElement
  if (!ctx || !analyticsData.value.length) return
  if (stackedAreaChart) stackedAreaChart.destroy()

  // Sort by submission date
  const sorted = analyticsData.value
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Cumulative counts
  let cumulative: Record<string, number> = { bronze: 0, silver: 0, gold: 0, ruby: 0, emerald: 0, diamond: 0 }
  const labels: string[] = []
  const datasets: Record<string, number[]> = {
    bronze: [],
    silver: [],
    gold: [],
    ruby: [],
    emerald: [],
    diamond: [],
  }

  for (const sub of sorted) {
    const tier = sub.additional_files.tier.toLowerCase()
    if (cumulative[tier] !== undefined) cumulative[tier] += 1

    labels.push(new Date(sub.created_at).toISOString().split('T')[0]) // YYYY-MM-DD
    for (const t of Object.keys(cumulative)) {
      datasets[t].push(cumulative[t])
    }
  }

  stackedAreaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: Object.entries(datasets).map(([tier, data]) => ({
        label: tier.charAt(0).toUpperCase() + tier.slice(1),
        data,
        fill: true,
        borderColor: 'transparent',
        backgroundColor: (() => {
          switch (tier) {
            case 'bronze': return 'rgb(205,127,50)'
            case 'silver': return 'rgb(192,192,192)'
            case 'gold': return 'rgb(255,215,0)'
            case 'ruby': return 'rgb(224,17,95)'
            case 'emerald': return 'rgb(80,200,120)'
            case 'diamond': return 'rgb(185,242,255)'
            default: return 'rgb(192,132,252)'
          }
        })(),
        borderWidth: 0,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
      })),
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Cumulative Attempts by Tier', font: { size: 16 } },
        tooltip: { mode: 'index', intersect: false },
        legend: { position: 'top' },
      },
      scales: {
        x: { type: 'time', time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd' } },
        y: { beginAtZero: true, title: { display: true, text: 'Cumulative Attempts' } },
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
  <div class="overflow-x-auto w-full flex justify-center">
    <canvas id="cumulativeChart" class="w-full max-w-5xl h-96 sm:h-[32rem]"></canvas>
  </div>
</template>