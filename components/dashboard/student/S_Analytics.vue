<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { useApiFetch } from '@/composables/useApiFetch'
import bronzeIcon from '~/assets/flat-icons/bronze.png'
import silverIcon from '~/assets/flat-icons/silver.png'
import goldIcon from '~/assets/flat-icons/gold.png'
import rubyIcon from '~/assets/flat-icons/ruby.png'
import emeraldIcon from '~/assets/flat-icons/emerald.png'
import diamondIcon from '~/assets/flat-icons/diamond.png'
import FunLoader from '~/components/FunLoader.vue'
import EloDistribution from "~/components/dashboard/student/analytics/EloDistribution.vue";
import PassFailAttempts from "~/components/dashboard/student/analytics/PassFailAttempts.vue";
import TierDistribution from "~/components/dashboard/student/analytics/TierDistribution.vue";
import AttemptsOverTime from "~/components/dashboard/student/analytics/AttemptsOverTime.vue";
import CumulativeAttempts from "~/components/dashboard/student/analytics/CumulativeAttempts.vue";
import PassRate from "~/components/dashboard/student/analytics/PassRate.vue";

const loading = ref(true)
const { apiFetch } = useApiFetch()

// Badge icons
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

// Fetch badges
const fetchBadges = async () => {
  try {
    // Fetch current semester first
    const semesters: any[] = await apiFetch('/semesters/')
    const currentSemester = semesters.find(s => s.is_current)
    if (!currentSemester) return

    // Fetch modules for student
    const modulesRes: Array<{ code: string; semester_id: string }> = await apiFetch('/admin/')
    const currentModules = modulesRes.filter(m => m.semester_id === currentSemester.id)
    const moduleCodes = currentModules.map(m => m.code)

    badges.value = { bronze: 0, silver: 0, gold: 0, ruby: 0, emerald: 0, diamond: 0 }

    for (const moduleCode of moduleCodes) {
      const res: Array<{ badge_type: string; badge_count: number }> = await apiFetch(
          `/analytics/badges?module_code=${moduleCode}`
      )
      res.forEach(b => {
        const type = b.badge_type.toLowerCase()
        if (badges.value[type] !== undefined) badges.value[type] += b.badge_count
      })
    }
  } catch (err) {
    console.error('Failed to fetch badges:', err)
  }
}

// Fetch leaderboard
const fetchLeaderboard = async () => {
  try {
    const data = await apiFetch('/analytics/global/leaderboard')
    leaderboard.value = data.sort((a, b) => a.global_rank - b.global_rank)
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
  }
}

// Fetch profile
const title_name = ref('')
const fetchProfile = async () => {
  try {
    const profile = await apiFetch('/profiles/me')
    title_name.value = profile.title_name || 'No Title'
  } catch (err) {
    console.error('Failed to fetch profile:', err)
  }
}

// Podium setup
const podium = computed(() => leaderboard.value.slice(0, 3))
const restStudents = computed(() => leaderboard.value.slice(3))

const podiumHeights = ref<number[]>([0,0,0])
const maxPodiumHeight = ref(0)
const setPodiumHeight = () => {
  nextTick(() => {
    const cards = document.querySelectorAll<HTMLDivElement>('.podium-card')
    podiumHeights.value = Array.from(cards).map(c => c.offsetHeight)
    maxPodiumHeight.value = Math.max(...podiumHeights.value)
  })
}

// Tabs
const tabs =
    [
      'ELO Distribution',
      'Tier Distribution',
      'Attempts Over Time',
      'Cumulative Attempts',
      'Pass vs Fail Attempts',
      'Pass Rate'
    ]
const activeTab = ref(tabs[0])

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchProfile(),
      fetchBadges(),
      fetchLeaderboard(),
    ])
  } catch (err) {
    console.error('Failed to fetch student analytics data:', err)
  } finally {
    loading.value = false
    nextTick(setPodiumHeight)
  }
})

watch(podium, () => setPodiumHeight())
</script>

<template>
  <div>
    <FunLoader v-if="loading" />

    <div v-else class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
      <!-- Charts with tabs -->
      <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 shadow">
        <div>
          <!-- Tabs -->
          <div class="flex border-b border-neutral-300 dark:border-neutral-700 mb-4">
            <button
                v-for="tab in tabs"
                :key="tab"
                @click="activeTab = tab"
                :class="[
                'px-4 py-2 font-medium text-sm transition-colors',
                activeTab === tab
                  ? 'border-b-2 border-purple-400 text-purple-400'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Chart Display -->
          <div v-show="activeTab === 'ELO Distribution'">
            <EloDistribution />
          </div>

          <div v-show="activeTab === 'Tier Distribution'">
            <TierDistribution />
          </div>

          <div v-show="activeTab === 'Attempts Over Time'">
            <AttemptsOverTime />
          </div>

          <div v-show="activeTab === 'Cumulative Attempts'">
            <CumulativeAttempts />
          </div>

          <div v-show="activeTab === 'Pass vs Fail Attempts'">
            <PassFailAttempts />
          </div>

          <div v-show="activeTab === 'Pass Rate'">
            <PassRate />
          </div>
        </div>
      </div>

      <!-- Badges + Title -->
      <div class="grid gap-6 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 mt-6">
        <Card class="h-auto sm:h-40 p-2 sm:p-6 flex justify-center items-center">
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-6 w-full">
            <div v-for="(icon, key) in badgeIcons" :key="key" class="flex flex-col items-center">
              <img :src="icon" class="w-10 h-10 sm:w-14 sm:h-14" :alt="key" />
              <span class="text-sm sm:text-lg mt-1">{{ badges[key] || 0 }}</span>
            </div>
          </div>
        </Card>

        <Card class="h-40 sm:h-auto p-4 sm:p-6 flex items-center justify-center">
          <CardContent class="h-full flex flex-col justify-center items-center">
            <span class="text-sm">Awarded Title</span>
            <span class="text-3xl sm:text-4xl font-semibold mt-2">{{ title_name }}</span>
          </CardContent>
        </Card>
      </div>

      <!-- Podium -->
      <div v-if="podium.length >= 3" class="mt-8 flex flex-col sm:flex-row sm:justify-center sm:items-end gap-2 sm:gap-4">
        <!-- Podium Cards -->
        <div
            v-for="(place, index) in podium"
            :key="index"
            class="podium-card rounded-lg p-4 flex flex-col shadow w-36 sm:w-40 items-center justify-between relative"
            :class="{
            'bg-yellow-100 dark:bg-yellow-900': index === 0,
            'bg-neutral-100 dark:bg-neutral-900': index !== 0
          }"
            :style="{ minHeight: maxPodiumHeight + 'px' }"
        >
          <div class="flex flex-col items-center">
            <span class="text-sm font-semibold mb-1">{{ index + 1 }}{{ index === 0 ? 'st' : index === 1 ? 'nd' : 'rd' }}</span>
            <img :src="[goldIcon, silverIcon, bronzeIcon][index]" class="w-12 sm:w-16 h-12 sm:h-16" />
          </div>
          <div class="flex flex-col items-center mt-2">
            <span class="text-xs sm:text-sm text-neutral-500 text-center">{{ place.title_name }}</span>
            <span class="font-semibold text-center text-sm sm:text-base">{{ place.full_name }}</span>
            <span class="text-xs sm:text-sm text-neutral-500">{{ place.current_elo }} pts</span>
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="mt-8 overflow-x-auto">
        <div class="min-w-[400px] sm:min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Student name</TableHead>
                <TableHead>Total Badges</TableHead>
                <TableHead>ELO</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-for="student in restStudents" :key="student.student_id">
                <TableCell>{{ student.global_rank }}</TableCell>
                <TableCell>{{ student.title_name }}</TableCell>
                <TableCell>{{ student.full_name }}</TableCell>
                <TableCell>{{ student.total_badges }}</TableCell>
                <TableCell>{{ student.current_elo }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </div>
</template>