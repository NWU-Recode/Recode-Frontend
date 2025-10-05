<script setup lang="ts">

import { ref, computed } from 'vue'
import { Card, CardContent } from "~/components/ui/card";
import Bronze from '~/assets/flat-icons/bronze.png'
import Silver from '~/assets/flat-icons/silver.png'
import Gold from '~/assets/flat-icons/gold.png'
import Ruby from '~/assets/flat-icons/ruby.png'
import Emerald from '~/assets/flat-icons/emerald.png'
import Diamond from '~/assets/flat-icons/diamond.png'

// Topics used for history generation
const topics = ['If Statements', 'Else Statements', 'While Loops', 'Do-While Loops']

// Lecturer analytics submissions
const submissionsList = [
  { name: "John Doe", number: "31765387", topic: "If Statements", badge: "Bronze", time: "10 min" },
  { name: "Jane Doe", number: "45609312", topic: "If Statements", badge: "Gold", time: "2.3 hours" },
  { name: "Alex Mason", number: "32975107", topic: "If Statements", badge: "Silver", time: "45 min" },
  { name: "Bianca Jackson", number: "26895032", topic: "If Statements", badge: "Ruby", time: "4.7 hours" },
  { name: "Owen Mckenzie", number: "40787864", topic: "If Statements", badge: "Gold", time: "57 min" },
  { name: "Monica Parker", number: "28356767", topic: "If Statements", badge: "Silver", time: "1.1 hours" },
]

// Badge weights
const badgeWeights: Record<string, number> = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
  Ruby: 4,
  Emerald: 8,
  Diamond: 10,
}

// Badge images mapping
const badgeImages: Record<string, string> = { Bronze, Silver, Gold, Ruby, Emerald, Diamond }

// Add history to each student (simulate other topics)
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

// Compute leaderboard data (including history)
const leaderboard = computed(() => {
  return students.map(s => {
    // Merge main badge + history badges
    const allBadges = [s.badge, ...s.history.map(h => h.badge)]
    const totalScore = allBadges.reduce((sum, b) => sum + (badgeWeights[b] || 0), 0)
    const highestBadge = allBadges.reduce((prev, curr) => (badgeWeights[curr] > badgeWeights[prev] ? curr : prev), allBadges[0])
    return { ...s, totalScore, highestBadge }
  }).sort((a, b) => b.totalScore - a.totalScore)
})

// Podium (top 3)
const podium = computed(() => leaderboard.value.slice(0, 3))

// Rest of students
const restStudents = computed(() => leaderboard.value.slice(3))
</script>

<template>
  <div class="mt-8 h-80 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow">
    <div class="flex items-center gap-2 mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
      <span>Space for graphs</span>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2 md:grid-cols-1 md:gap-8">
    <Card class="h-40 mt-6 p-6 space-y-6 flex justify-center items-center">
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-6 mb-6 md:mb-0">
        <div class="flex flex-col items-center">
          <img src="/assets/flat-icons/bronze.png" class="w-14 h-14" alt="" />
          <span class="text-lg mt-1">2</span>
        </div>
        <div class="flex flex-col items-center">
          <img src="/assets/flat-icons/silver.png" class="w-14 h-14" alt="" />
          <span class="text-lg mt-1">1</span>
        </div>
        <div class="flex flex-col items-center">
          <img src="/assets/flat-icons/gold.png" class="w-14 h-14" alt="" />
          <span class="text-lg mt-1">0</span>
        </div>
        <div class="flex flex-col items-center">
          <img src="/assets/flat-icons/ruby.png" class="w-14 h-14" alt="" />
          <span class="text-lg mt-1">1</span>
        </div>
        <div class="flex flex-col items-center">
          <img src="/assets/flat-icons/emerald.png" class="w-14 h-14" alt="" />
          <span class="text-lg mt-1">0</span>
        </div>
        <div class="flex flex-col items-center">
          <img src="/assets/flat-icons/diamond.png" class="w-14 h-14" alt="" />
          <span class="text-lg mt-1">0</span>
        </div>
      </div>
    </Card>

    <Card class="h-40 mt-6 p-6">
      <CardContent class="h-full flex flex-col justify-center items-center">
        <div class="flex justify-center">
          <span class="text-sm">Awarded Title</span>
        </div>

        <div class="flex justify-center mt-2">
          <span class="text-4xl font-semibold">Sorcerer</span>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Podium -->
  <div class="mt-8 flex justify-center items-center gap-8">
    <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow w-32 h-48 flex flex-col items-center justify-end p-4 relative">
      <span class="absolute top-2 text-sm font-semibold">2nd</span>
      <img :src="badgeImages[podium[1].highestBadge]" class="w-16 h-16 mb-2" />
      <span class="font-semibold text-center">{{ podium[1].name }}</span>
      <span class="text-sm text-neutral-500">{{ podium[1].totalScore }} pts</span>
    </div>

    <div class="rounded-lg bg-yellow-100 dark:bg-yellow-900 p-4 flex flex-col shadow w-36 h-56 flex flex-col items-center justify-end p-4 relative">
      <span class="absolute top-2 text-sm font-semibold">1st</span>
      <img :src="badgeImages[podium[0].highestBadge]" class="w-20 h-20 mb-2" />
      <span class="font-semibold text-center">{{ podium[0].name }}</span>
      <span class="text-sm text-neutral-500">{{ podium[0].totalScore }} pts</span>
    </div>

    <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow w-32 h-48 flex flex-col items-center justify-end p-4 relative">
      <span class="absolute top-2 text-sm font-semibold">3rd</span>
      <img :src="badgeImages[podium[2].highestBadge]" class="w-16 h-16 mb-2" />
      <span class="font-semibold text-center">{{ podium[2].name }}</span>
      <span class="text-sm text-neutral-500">{{ podium[2].totalScore }} pts</span>
    </div>
  </div>

  <!-- Rest of leaderboard table -->
  <div class="mt-8">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Student name</TableHead>
          <TableHead>Student number</TableHead>
          <TableHead>Highest Badge</TableHead>
          <TableHead>Total Score</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-for="(student, index) in restStudents" :key="student.number">
          <TableCell>{{ index + 4 }}</TableCell>
          <TableCell>{{ student.name }}</TableCell>
          <TableCell>{{ student.number }}</TableCell>
          <TableCell>
            <img :src="badgeImages[student.highestBadge]" class="w-6 h-6" :alt="student.highestBadge" />
          </TableCell>
          <TableCell>{{ student.totalScore }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped>

</style>
