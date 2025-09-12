<script setup lang="ts">
import { computed, ref } from 'vue'

const avgBadge = ref({
  name: '',
  icon: ''
})
</script>

<template>
  <div class="stat-card">
    <p class="stat-label">Average badge received</p>
    <div class="stat-badge">
      <span class="badge-icon">{{ avgBadge.icon }}</span>
      <span class="badge-name">{{ avgBadge.name }}</span>
    </div>
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
        margin-bottom: 12px;
    }

    .stat-badge {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .badge-icon {
        font-size: 36px;
        margin-bottom: 8px;
    }

    .badge-name {
        font-size: 20px;
        font-weight: 600;
        color: #333;
    }
</style>
