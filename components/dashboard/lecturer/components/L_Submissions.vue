<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const submissionsPercentage = 67
</script>

<template>
  <Card class="text-center">
    <CardHeader>
      <CardTitle>Submissions</CardTitle>
    </CardHeader>
    <CardContent>
      <p class="text-4xl font-bold">{{ submissionsPercentage }}%</p>
    </CardContent>
  </Card>
</template>

<style scoped>

</style>