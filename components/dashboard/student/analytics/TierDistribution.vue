<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useApiFetch } from '@/composables/useApiFetch'

Chart.register(...registerables)

const { apiFetch } = useApiFetch()
const analyticsData = ref<any>(null)
let tierChart: Chart | null = null

// Badge colors for visual consistency
const tierColors: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  ruby: '#E0115F',
  emerald: '#50C878',
  diamond: '#B9F2FF',
}

// Fetch analytics
const fetchAnalytics = async () => {
  try {
    analyticsData.value = await apiFetch('/student/me/analytics')
  } catch (err) {
    console.error('Failed to fetch student analytics:', err)
  } finally {
    nextTick(renderChart)
  }
}

// Render Pie/Donut chart
const renderChart = () => {
  const ctx = document.getElementById('tierChart') as HTMLCanvasElement
  if (!ctx || !analyticsData.value) return

  // Count each tier
  const tierCounts: Record<string, number> = {}
  analyticsData.value.recent.forEach((r: any) => {
    const tier = r.additional_files.tier || 'unknown'
    tierCounts[tier] = (tierCounts[tier] || 0) + 1
  })

  const labels = Object.keys(tierCounts)
  const data = Object.values(tierCounts)
  const backgroundColors = labels.map(l => tierColors[l] || '#888888')

  if (tierChart) tierChart.destroy()

  tierChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' },
        title: { display: true, text: 'Tier Distribution of Recent Attempts' },
      },
    },
  })
}

onMounted(() => fetchAnalytics())
</script>

<template>
  <div class="w-full">
    <div class="w-full h-96 sm:h-[32rem] flex justify-center items-center">
      <canvas id="tierChart" class="w-full h-full"></canvas>
    </div>
  </div>
</template>