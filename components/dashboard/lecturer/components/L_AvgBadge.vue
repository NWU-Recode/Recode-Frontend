<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const submissions = [
  { badge: "Bronze" },
  { badge: "Gold" },
  { badge: "Silver" },
  { badge: "Ruby" },
  { badge: "Gold" },
  { badge: "Silver" },
]

// Assign weights for calculation
const badgeWeights: Record<string, number> = {
  "Bronze": 1,
  "Silver": 2,
  "Gold": 3,
  "Ruby": 4,
}

function calculateAverageBadge(data: typeof submissions) {
  const total = data.reduce((sum, s) => sum + (badgeWeights[s.badge] || 0), 0)
  const avg = total / data.length
  const closest = Object.entries(badgeWeights).reduce(
    (prev, curr) => Math.abs(curr[1] - avg) < Math.abs(prev[1] - avg) ? curr : prev
  )
  return closest[0]
}

const averageBadge = calculateAverageBadge(submissions)
</script>

<template>
  <Card class="text-center">
    <CardHeader>
      <CardTitle>Average Badge Received</CardTitle>
    </CardHeader>
    <CardContent>
      <p class="text-2xl font-bold">{{ averageBadge }}</p>
    </CardContent>
  </Card>
</template>

<style scoped>

</style>