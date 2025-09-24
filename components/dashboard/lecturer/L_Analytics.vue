<script setup lang="ts">
import { computed, ref } from 'vue'
import {Card, CardContent} from "~/components/ui/card";
import Bronze from '~/assets/flat-icons/bronze.png'
import Silver from '~/assets/flat-icons/silver.png'
import Gold from '~/assets/flat-icons/gold.png'
import Ruby from '~/assets/flat-icons/ruby.png'
import Emerald from '~/assets/flat-icons/emerald.png'
import Diamond from '~/assets/flat-icons/diamond.png'
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "~/components/ui/dropdown-menu"
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell} from "~/components/ui/table"

const topics = [
  'If Statements',
  'Else Statements',
  'While Loops',
  'Do-While Loops',
]
const selectedTopic = ref<string | null>(null)

const submissionsPercentage = 67

const timeSubmissions = [
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
  const total = timeSubmissions.reduce((sum, s) => sum + parseTime(s.time), 0)
  return Math.round(total / timeSubmissions.length)
})

const badgeSubmissions = [
  { badge: "Bronze" },
  { badge: "Gold" },
  { badge: "Silver" },
  { badge: "Ruby" },
  { badge: "Emerald" },
  { badge: "Diamond" },
]

// Badge images mapping
const badgeImages: Record<string, string> = {
  Bronze: Bronze,
  Silver: Silver,
  Gold: Gold,
  Ruby: Ruby,
  Emerald: Emerald,
  Diamond: Diamond,
}

// Assign weights for calculation
const badgeWeights: Record<string, number> = {
  "Bronze": 1,
  "Silver": 2,
  "Gold": 3,
  "Ruby": 4,
  "Emerald": 8,
  "Diamond": 10,
}

function calculateAverageBadge(data: typeof badgeSubmissions) {
  const total = data.reduce((sum, s) => sum + (badgeWeights[s.badge] || 0), 0)
  const avg = total / data.length
  const closest = Object.entries(badgeWeights).reduce(
      (prev, curr) => Math.abs(curr[1] - avg) < Math.abs(prev[1] - avg) ? curr : prev
  )
  return closest[0]
}

const averageBadge = calculateAverageBadge(badgeSubmissions)

const submissionsList = [
  { name: "John Doe", number: "31765387", topic: "If Statements", badge: "Bronze", time: "10 min" },
  { name: "Jane Doe", number: "45609312", topic: "If Statements", badge: "Gold", time: "2.3 hours" },
  { name: "Alex Mason", number: "32975107", topic: "If Statements", badge: "Silver", time: "45 min" },
  { name: "Bianca Jackson", number: "26895032", topic: "If Statements", badge: "Ruby", time: "4.7 hours" },
  { name: "Owen Mckenzie", number: "40787864", topic: "If Statements", badge: "Gold", time: "57 min" },
  { name: "Monica Parker", number: "28356767", topic: "If Statements", badge: "Silver", time: "1.1 hours" },
]

const students = submissionsList.map(s => ({
  ...s,
  history: topics
      .filter(t => t !== s.topic)
      .map((topic, i) => ({
        topic,
        badge: ["Bronze", "Silver", "Gold", "Ruby", "Emerald", "Diamond"][i % 4],
        time: ["15 min", "1.2 hours", "30 min", "3.5 hours"][i % 4],
      }))
}))
</script>

<template>
<div class="my-8">
  <DropdownMenu>
    <DropdownMenuTrigger
        class="min-w-[220px] px-4 py-2 border rounded-md shadow-sm cursor-pointer flex items-center justify-between"
    >
      {{ selectedTopic || 'Select a topic' }}
    </DropdownMenuTrigger>

    <DropdownMenuContent
        class="min-w-[220px] w-full"
    >
      <DropdownMenuItem
          v-for="topic in topics"
          :key="topic"
          @click="selectedTopic = topic"
      >
        {{ topic }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <div class="grid mt-4 gap-2 lg:grid-cols-3 md:grid-cols-2 md:gap-8">
    <Card>
      <CardContent class="h-full flex flex-col justify-between p-8">
        <div class="flex justify-center">
          <span class="text-sm">Submissions</span>
        </div>

        <div class=" mt-2 flex items-start justify-center">
          <span class="text-4xl font-semibold">{{ submissionsPercentage }}%</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="h-full flex flex-col justify-between p-8">
        <div class="flex justify-center">
          <span class="text-sm">Average Completion Rate</span>
        </div>

        <div class=" mt-2 flex items-start justify-center">
          <span class="text-4xl font-semibold">{{ avgTime }} min</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="h-full flex flex-col justify-between p-8">
        <div class="flex justify-center">
          <span class="text-sm">Average Badge Received</span>
        </div>

        <div class=" mt-2 flex items-start justify-center">
          <img
              :src="badgeImages[averageBadge]"
              class="w-14 h-14"
              :alt="averageBadge"
          />
        </div>
      </CardContent>
    </Card>
  </div>

  <div class="mt-8 h-80 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow">
    <div class="flex items-center gap-2 mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
      <span>Space for graphs</span>
    </div>
  </div>

  <div class="mt-8">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead />
          <TableHead>Student name</TableHead>
          <TableHead>Student number</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead>Badge</TableHead>
          <TableHead>Time spent</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
            v-for="student in students"
            :key="student.number"
            collapsible
        >
          <!-- Main row -->
          <template #default>
            <TableCell >{{ student.name }}</TableCell>
            <TableCell >{{ student.number }}</TableCell>
            <TableCell >{{ student.topic }}</TableCell>
            <TableCell>
              <img
                  :src="badgeImages[student.badge]"
                  class="w-8 h-8"
                  :alt="student.badge"
              />
            </TableCell>
            <TableCell >{{ student.time }}</TableCell>
          </template>

          <!-- Expanded content -->
          <template #expanded>
            <TableRow
                v-for="(h, i) in student.history"
                :key="i"
                class="bg-muted/20"
            >
              <template #default>
                <TableCell /> <!-- empty collapsible icon column -->
                <TableCell /> <!-- empty name -->
                <TableCell /> <!-- empty number -->
                <TableCell >{{ h.topic }}</TableCell>
                <TableCell >
                  <img
                      :src="badgeImages[h.badge]"
                      class="w-8 h-8"
                      :alt="h.badge"
                  />
                </TableCell>
                <TableCell >{{ h.time }}</TableCell>
              </template>
            </TableRow>
          </template>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</div>

</template>

<style scoped>

</style>
