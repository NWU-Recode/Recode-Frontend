<script setup lang="ts">
import { computed } from "vue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Example dataset (same as in L_SubmissionsList.vue)
const submissions = [
  { time: "10 min" },
  { time: "2.3 hours" },
  { time: "45 min" },
  { time: "4.7 hours" },
  { time: "57 min" },
  { time: "1.1 hours" },
]

function parseTime(t: string) {
  if (t.includes("hours")) return parseFloat(t) * 60
  if (t.includes("hour")) return parseFloat(t) * 60
  return parseFloat(t) // already in minutes
}

const avgTime = computed(() => {
  const total = submissions.reduce((sum, s) => sum + parseTime(s.time), 0)
  return Math.round(total / submissions.length)
})
</script>

<template>
  <Card class="text-center">
    <CardHeader>
      <CardTitle>Average Completion Rate</CardTitle>
    </CardHeader>
    <CardContent>
      <p class="text-4xl font-bold">{{ avgTime }} min</p>
    </CardContent>
  </Card>
</template>

<style scoped>

</style>