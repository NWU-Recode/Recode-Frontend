<script setup lang="ts">
import L_AvgCompletionTime from './components/L_AvgCompletionTime.vue'
import L_AvgBadge from './components/L_AvgBadge.vue'
import L_Graph from './components/L_Graph.vue'
import L_SubmissionsList from './components/L_SubmissionsList.vue'
import L_Submissions from './components/L_Submissions.vue'
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <L_Submissions />
      <L_AvgCompletionTime />
      <L_AvgBadge />
    </div>
    <L_Graph />
    <L_SubmissionsList />
  </div>
</template>

<style scoped>

</style>