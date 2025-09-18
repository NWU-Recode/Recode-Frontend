<script setup lang="ts">
import AreaChart from '@/components/ui/chart-area/AreaChart.vue'

const badgeMap = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Ruby' }

const chartData = {
  labels: [
    'If statements',
    'String to integer',
    'Reverse integer',
    'Binary tree',
    'Path sum',
    'Sort list'
  ],
  datasets: [
    {
      label: 'Average Badges',
      data: [1, 2, 1, 3, 1, 3],
      fill: true,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.15)',
      tension: 0.3
    }
  ]
}


/*const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.parsed.y
          return `${context.dataset.label}: ${badgeMap[value] || value}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: (value) => badgeMap[value] || value
      }
    }
  }
}
</script>

<template>
  <div class="w-full h-64">
    <!--<AreaChart :data="chartData" :options="chartOptions" />-->
  </div>
</template>
*/

<style scoped>

</style>