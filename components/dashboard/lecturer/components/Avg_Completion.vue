<script setup lang="ts">
import { computed, ref } from 'vue'

    const averageCompletionRate = ref(0)
</script>

<template>
  <div class="stat-card">
    <p class="stat-label">Average completion rate</p>
    <p class="stat-value">
      {{ averageCompletionRate }}
      <span class="stat-unit">min</span>
    </p>
  </div>
</template>

<style scoped>
    .stat-card {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        width: 220px;
    }

    .stat-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
    }

    .stat-value {
        font-size: 32px;
        font-weight: 600;
        color: #333;
    }

    .stat-unit {
        font-size: 16px;
        font-weight: 400;
        color: #888;
        margin-left: 4px;
    }
</style>
