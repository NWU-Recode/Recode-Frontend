<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { useApiFetch } from '@/composables/useApiFetch'

// --- Badge icons ---
import bronzeIcon from '~/assets/flat-icons/bronze.png'
import silverIcon from '~/assets/flat-icons/silver.png'
import goldIcon from '~/assets/flat-icons/gold.png'
import rubyIcon from '~/assets/flat-icons/ruby.png'
import emeraldIcon from '~/assets/flat-icons/emerald.png'
import diamondIcon from '~/assets/flat-icons/diamond.png'

const { apiFetch } = useApiFetch()

// Badge icons mapping
const badgeIcons: Record<string, string> = {
  bronze: bronzeIcon,
  silver: silverIcon,
  gold: goldIcon,
  ruby: rubyIcon,
  emerald: emeraldIcon,
  diamond: diamondIcon,
}

// Badge counts
const badges = ref<Record<string, number>>({
  bronze: 0,
  silver: 0,
  gold: 0,
  ruby: 0,
  emerald: 0,
  diamond: 0,
})

// Leaderboard data
const leaderboard = ref<any[]>([])

// Fetch badges for current student
// --- Fetch badges for the logged-in student ---
async function fetchBadges() {
  try {
    // Get all modules visible to this student
    const modulesRes: Array<{ code: string }> = await apiFetch('/admin/')
    const moduleCodes: string[] = modulesRes.map((m) => m.code)

    // Reset counts
    badges.value = {
      bronze: 0,
      silver: 0,
      gold: 0,
      ruby: 0,
      emerald: 0,
      diamond: 0,
    }

    // Fetch badges for each module
    for (const moduleCode of moduleCodes) {
      const res: Array<{ badge_type: string; badge_count: number }> = await apiFetch(
          `/badges?module_code=${moduleCode}`
      )
      res.forEach((b) => {
        const type = b.badge_type.toLowerCase()
        if (badges.value[type] !== undefined) {
          badges.value[type] += b.badge_count
        }
      })
    }
  } catch (err) {
    console.error('Failed to fetch badges:', err)
  }
}

// Fetch global leaderboard
const fetchLeaderboard = async () => {
  try {
    leaderboard.value = await apiFetch('/global/leaderboard')
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
  }
}

// Reactive variable for the current student's title
const title_name = ref('');

// Fetch current user profile
const fetchProfile = async () => {
  try {
    const profile = await apiFetch('/profiles/me')
    title_name.value = profile.title_name || 'No Title'
  } catch (err) {
    console.error('Failed to fetch profile:', err)
  }
}

onMounted(() => {
  fetchBadges()
  fetchLeaderboard()
  fetchProfile()
})

// Compute podium + rest
const podium = computed(() => leaderboard.value.slice(0, 3))
const restStudents = computed(() => leaderboard.value.slice(3))
</script>

<template>
  <!-- Graph placeholder -->
  <div class="mt-8 h-72 sm:h-80 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow">
    <div class="flex items-center gap-2 mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
      <span>Space for graphs</span>
    </div>
  </div>

  <!-- Badges + Awarded Title -->
  <div class="grid gap-6 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 mt-6">
    <!-- Badges -->
    <Card class="h-auto sm:h-40 p-2 sm:p-6 flex justify-center items-center">
      <div
          class="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-6 w-full"
      >
        <div
            v-for="(icon, key) in badgeIcons"
            :key="key"
            class="flex flex-col items-center"
        >
          <img
              :src="icon"
              class="w-10 h-10 sm:w-14 sm:h-14"
              :alt="key"
          />
          <span class="text-sm sm:text-lg mt-1">{{ badges[key] || 0 }}</span>
        </div>
      </div>
    </Card>

    <!-- Awarded Title -->
    <Card class="h-40 sm:h-auto p-4 sm:p-6 flex items-center justify-center">
      <CardContent class="h-full flex flex-col justify-center items-center">
        <div class="flex justify-center">
          <span class="text-sm">Awarded Title</span>
        </div>
        <div class="flex justify-center mt-2">
          <span class="text-3xl sm:text-4xl font-semibold">{{ title_name }}</span>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Podium -->
  <div v-if="podium.length >= 3" class="mt-8 flex flex-col sm:flex-row sm:justify-center sm:items-end gap-4 sm:gap-8">

    <!-- 1st place (always on top for small screens, center for large screens) -->
    <div
        class="rounded-lg bg-yellow-100 dark:bg-yellow-900 p-4 flex flex-col shadow w-36 sm:w-40 h-48 sm:h-56 items-center justify-end relative self-center"
    >
      <span class="absolute top-1 sm:top-2 text-sm font-semibold">1st</span>
      <img :src="goldIcon" class="w-16 sm:w-20 h-16 sm:h-20 mb-4 sm:mb-6" />
      <span class="font-semibold text-center text-sm sm:text-base">{{ podium[0].full_name }}</span>
      <span class="text-xs sm:text-sm text-neutral-500">{{ podium[0].current_elo }} pts</span>
    </div>

    <!-- 2nd and 3rd place wrapper -->
    <div class="flex justify-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
      <!-- 2nd place -->
      <div
          class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow w-32 sm:w-40 h-44 sm:h-48 items-center justify-end relative"
      >
        <span class="absolute top-1 sm:top-2 text-sm font-semibold">2nd</span>
        <img :src="silverIcon" class="w-12 sm:w-16 h-12 sm:h-16 mb-1 sm:mb-2" />
        <span class="font-semibold text-center text-sm sm:text-base">{{ podium[1].full_name }}</span>
        <span class="text-xs sm:text-sm text-neutral-500">{{ podium[1].current_elo }} pts</span>
      </div>

      <!-- 3rd place -->
      <div
          class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow w-32 sm:w-40 h-44 sm:h-48 items-center justify-end relative"
      >
        <span class="absolute top-1 sm:top-2 text-sm font-semibold">3rd</span>
        <img :src="bronzeIcon" class="w-12 sm:w-16 h-12 sm:h-16 mb-1 sm:mb-2" />
        <span class="font-semibold text-center text-sm sm:text-base">{{ podium[2].full_name }}</span>
        <span class="text-xs sm:text-sm text-neutral-500">{{ podium[2].current_elo }} pts</span>
      </div>
    </div>
  </div>

  <!-- Leaderboard Table -->
  <div class="mt-8 overflow-x-auto">
    <div class="min-w-[400px] sm:min-w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Student name</TableHead>
            <TableHead>Total Badges</TableHead>
            <TableHead>ELO</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="student in restStudents" :key="student.student_id">
            <TableCell>{{ student.global_rank }}</TableCell>
            <TableCell>{{ student.full_name }}</TableCell>
            <TableCell>{{ student.total_badges }}</TableCell>
            <TableCell>{{ student.current_elo }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
