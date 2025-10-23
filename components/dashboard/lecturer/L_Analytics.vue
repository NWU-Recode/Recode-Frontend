<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Card, CardContent } from '~/components/ui/card'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import Bronze from '~/assets/flat-icons/bronze.png'
import Silver from '~/assets/flat-icons/silver.png'
import Gold from '~/assets/flat-icons/gold.png'
import Ruby from '~/assets/flat-icons/ruby.png'
import Emerald from '~/assets/flat-icons/emerald.png'
import Diamond from '~/assets/flat-icons/diamond.png'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '~/components/ui/table'
import { useApiFetch } from '@/composables/useApiFetch'
import FunLoader from '~/components/FunLoader.vue'
import { AlertTriangle } from 'lucide-vue-next'

const isLoading = ref(true)
Chart.register(...registerables)

const { apiFetch } = useApiFetch()
const { user, isAuthenticated, fetchUser } = useAuth()
const token = ref<string | null>(null)
const activeTab = ref<'Leaderboard' | 'Challenge Progress'>('Leaderboard')
const tabs = ['Leaderboard', 'Challenge Progress'] as const

async function initAuth() {
  if (!isAuthenticated.value) {
    const u = await fetchUser()
    if (!u) return
  }
  token.value = localStorage.getItem('access_token')
}
await initAuth()

// --- Leaderboard ---
const leaderboardData = ref<any[]>([])
let leaderboardChart: Chart | null = null

async function fetchLeaderboard(moduleCode?: string) {
  try {
    const url = moduleCode
        ? `/analytics/global/leaderboard?module_code=${moduleCode}`
        : '/analytics/global/leaderboard'

    const res = await apiFetch(url)
    leaderboardData.value = res
    renderLeaderboardChart()
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
  }
}

const highRiskStudents = ref<number[]>([])

async function fetchHighRiskStudents() {
  if (!token.value) await initAuth()
  if (!token.value) return

  try {
    const res = await apiFetch('/analytics/students/high-risk', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    // store student_ids in a simple array
    highRiskStudents.value = res.map((s: any) => s.student_id)
  } catch (err) {
    console.error('Failed to fetch high-risk students:', err)
  }
}

function renderLeaderboardChart() {
  const ctx = document.getElementById('leaderboardChart') as HTMLCanvasElement
  if (!ctx) return

  // Destroy previous chart instance if it exists
  if (leaderboardChart) leaderboardChart.destroy()

  leaderboardChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: leaderboardData.value.map(
        (s: any) => `${s.full_name} (#${s.global_rank})`
      ),
      datasets: [
        {
          label: 'Current ELO',
          data: leaderboardData.value.map((s: any) => s.current_elo),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Global Leaderboard (ELO)',
        },
      },
      scales: {
        x: {
          ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Current ELO' },
        },
      },
    },
  })
}

// --- Modules ---
const modules = ref<any[]>([])
const selectedModuleCode = ref<string | null>(null)

const studentsForSelectedModule = computed(() =>
    selectedModuleCode.value ? studentsByModule[selectedModuleCode.value] ?? [] : []
)

// --- Students per module ---
const studentsByModule = reactive<Record<string, any[]>>({})

// --- Challenge selection (optional) ---
const challenges = ref<any[]>([])
const selectedChallengeId = ref<string | null>(null)
const selectedChallenge = computed(() =>
    challenges.value.find(c => c.challenge_id === selectedChallengeId)
)

// --- Top cards aggregated over all challenges ---
const submissionsPercentage = computed(() => {
  if (!challengeProgressData.value.length) return 0
  const totalCompleted = challengeProgressData.value.reduce(
      (sum, c) => sum + (c.students_completed || 0),
      0
  )
  const totalEnrolled = challengeProgressData.value.reduce(
      (sum, c) => sum + (c.total_enrolled_students || 0),
      0
  )
  return totalEnrolled ? Math.round((totalCompleted / totalEnrolled) * 100) : 0
})

const avgElo = computed(() => {
  const challengesWithElo = challengeProgressData.value.filter(c => c.avg_elo_earned != null)
  if (!challengesWithElo.length) return 0
  const totalElo = challengesWithElo.reduce((sum, c) => sum + c.avg_elo_earned, 0)
  return Math.round(totalElo / challengesWithElo.length)
})

const avgCompletionTime = computed(() => {
  const challengesWithTime = challengeProgressData.value.filter(c => c.avg_completion_time_minutes != null)
  if (!challengesWithTime.length) return 0
  const totalTime = challengesWithTime.reduce((sum, c) => sum + c.avg_completion_time_minutes, 0)
  return Math.round(totalTime / challengesWithTime.length)
})

// --- Badge image mapping ---
const badgeImages: Record<string, string> = {
  bronze: Bronze,
  silver: Silver,
  gold: Gold,
  ruby: Ruby,
  emerald: Emerald,
  diamond: Diamond,
}

const semesters = ref<any[]>([])
const currentSemester = ref<any | null>(null)

async function fetchSemesters() {
  try {
    const res = await apiFetch('/semesters/', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    semesters.value = res
    currentSemester.value = res.find((s: any) => s.is_current)
  } catch (err) {
    console.error('Failed to fetch semesters:', err)
  }
}

// --- Fetch modules ---
async function fetchModules() {
  if (!token.value) await initAuth()
  if (!token.value) return

  try {
    const res = await apiFetch('/admin/', {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    // Only keep modules from the current semester
    const filtered = currentSemester.value
        ? res.filter((m: any) => m.semester_id === currentSemester.value.id)
        : res

    modules.value = filtered
  } catch (err) {
    console.error('Failed to fetch modules', err)
  }
}

// --- Fetch student progress for a module and for pie chart ---
async function fetchChallengeProgress(moduleCode: string) {
  if (!token.value) await initAuth()
  if (!token.value) return

  try {
    // Fetch all challenges and filter those belonging to the selected module
    const res = await apiFetch('/analytics/challenge/progress', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    const filtered = res.filter((c: any) => c.module_code === moduleCode)

    challengeProgressData.value = filtered
    renderChallengeChart()
  } catch (err) {
    console.error('Failed to fetch challenge progress:', err)
  }

  try {
    const res = await apiFetch(`/analytics/challenge-progress?module_code=${moduleCode}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    const studentMap: Record<string, any> = {}
    res.forEach((entry: any) => {
      const badge = entry.highest_badge?.toLowerCase() || 'none'

      if (!studentMap[entry.student_number]) {
        studentMap[entry.student_number] = {
          name: entry.student_name,
          number: entry.student_number,
          history: [],
        }
      }

      studentMap[entry.student_number].history.push({
        topic: entry.challenge_name,
        badge,
        time: entry.total_time,
      })
    })

    studentsByModule[moduleCode] = Object.values(studentMap)
  } catch (err) {
    console.error('Failed to fetch challenge progress:', err)
  }
}

// --- Challenge Progress Pie Chart ---
const challengeProgressData = ref<any[]>([])
let challengeChart: Chart | null = null

function renderChallengeChart() {
  const ctx = document.getElementById('challengeChart') as HTMLCanvasElement
  if (!ctx) return

  if (challengeChart) challengeChart.destroy()

  const data = challengeProgressData.value

  challengeChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map((c: any) => c.challenge_name),
      datasets: [
        {
          label: 'Students Completed',
          data: data.map((c: any) => c.students_completed || 0),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'right',       // 'right' or 'left'
          align: 'center',
          labels: {
            boxWidth: 20,
            padding: 20,           // space between legend marker and text
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        title: {
          display: true,
          text:
              data.every((c: any) => c.students_completed === 0)
                  ? `No submissions yet for ${selectedModuleCode.value}`
                  : `Challenge Completion for ${selectedModuleCode.value}`,
          padding: {
            bottom: 20
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed
              return value === 0
                  ? '0 students completed (yet)'
                  : `${value} students completed`
            },
          },
        },
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      },
    },
  })

  // Ensure parent container is flex and centered
  const container = ctx.parentElement
  if (container) {
    container.style.display = 'flex'
    container.style.justifyContent = 'center'  // horizontally center
    container.style.alignItems = 'center'      // vertically center
    container.style.flexDirection = 'row'      // chart + legend side by side
    container.style.gap = '40px'               // space between chart and legend
    container.style.overflow = 'visible'       // prevent legend cutoff
  }
}

watch(selectedModuleCode, async (moduleCode) => {
  if (!moduleCode) return
  await fetchChallengeProgress(moduleCode)
  await fetchLeaderboard(moduleCode)
})

// When changing tab, re-render the chart for the same selected module
watch(activeTab, async (tab) => {
  const moduleCode = selectedModuleCode.value
  if (!moduleCode) return

  if (tab === 'Leaderboard') {
    await fetchLeaderboard(moduleCode)
  } else if (tab === 'Challenge Progress') {
    await fetchChallengeProgress(moduleCode)
  }
})

// --- Watch selected module to refresh students ---
watch(selectedModuleCode, async (val) => {
  if (!val) return
  await fetchChallengeProgress(val)
})

async function fetchAllAnalytics() {
  isLoading.value = true
  try {
    await fetchSemesters()
    await fetchModules()
    if (modules.value.length) {
      selectedModuleCode.value = modules.value[0].code
      await Promise.all([
        fetchLeaderboard(selectedModuleCode.value),
        fetchChallengeProgress(selectedModuleCode.value),
        fetchHighRiskStudents(selectedModuleCode.value)
      ])
    } else {
      await fetchLeaderboard()
    }
  } catch (err) {
    console.error('Failed to fetch lecturer analytics:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchAllAnalytics()
})
</script>

<template>
  <FunLoader v-if="isLoading" />
  <div v-else class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">

    <!-- Module Dropdown -->
    <div class="w-full max-w-sm">
      <DropdownMenu>
        <DropdownMenuTrigger
            class="w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm flex items-center justify-between text-sm sm:text-base whitespace-normal break-words"
        >
          {{ selectedModuleCode ? modules.find(m => m.code === selectedModuleCode)?.name : 'Select a module' }}
        </DropdownMenuTrigger>

        <DropdownMenuContent class="max-w-xs w-full break-words">
          <DropdownMenuItem
              v-for="mod in modules"
              :key="mod.code"
              @click="selectedModuleCode = mod.code"
              class="whitespace-normal"
          >
            <div class="flex flex-col">
              <span class="font-semibold">{{ mod.name }}</span>
              <span class="text-xs text-neutral-500">{{ mod.code }}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Top Cards -->
    <div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent class="flex flex-col items-center p-6 sm:p-8">
          <span class="text-sm sm:text-base">Submissions %</span>
          <span class="text-3xl sm:text-4xl font-semibold mt-2">{{ submissionsPercentage }}%</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex flex-col items-center p-6 sm:p-8">
          <span class="text-sm sm:text-base">Average ELO</span>
          <span class="text-3xl sm:text-4xl font-semibold mt-2">{{ avgElo }}</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex flex-col items-center p-6 sm:p-8">
          <span class="text-sm sm:text-base">Average Completion Time</span>
          <span class="text-3xl sm:text-4xl font-semibold mt-2">{{ avgCompletionTime }} min</span>
        </CardContent>
      </Card>
    </div>

    <!-- Graph placeholder -->
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

        <!-- Chart display -->
        <div v-if="activeTab === 'Leaderboard'">
          <div class="relative w-full" style="aspect-ratio: 16 / 9;">
            <canvas id="leaderboardChart" class="w-full h-full"></canvas>
          </div>
        </div>

        <div v-else-if="activeTab === 'Challenge Progress'" class="w-full">
          <div
              class="flex justify-center items-center"
              style="overflow: visible; min-height: 400px;"
          >
            <canvas id="challengeChart" class="max-w-full max-h-[500px]"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div class="w-full max-w-[370px] sm:max-w-full overflow-x-auto rounded-lg shadow">
      <div class="inline-block min-w-full">
        <Table class="table-auto w-full">
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Student Number</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow
                v-for="student in studentsForSelectedModule"
                :key="student.number"
                collapsible
            >
              <!-- Main row: only name & number -->
              <template #default>
                <TableCell class="flex items-center gap-1">
                  <TooltipProvider>
                    <template v-if="highRiskStudents.includes(student.number)">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle class="w-4 h-4 text-yellow-400 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          High-risk student – low completion rate or performance
                        </TooltipContent>
                      </Tooltip>
                    </template>
                  </TooltipProvider>
                  {{ student.number }}
                </TableCell>
                <TableCell>{{ student.name }}</TableCell>
                <TableCell />
              </template>

              <!-- Expanded row: per-challenge stats -->
              <template #expanded>
                <TableRow
                    v-for="(h, i) in student.history.length ? student.history : [{...student}]"
                    :key="i"
                    class="bg-muted/20"
                >
                  <template #default>
                    <TableCell />
                    <TableCell>{{ h.topic }}</TableCell>
                    <TableCell>{{ h.time }}</TableCell>
                    <TableCell>
                      <template v-if="h.badge && badgeImages[h.badge]">
                        <img
                            :src="badgeImages[h.badge]"
                            class="w-6 h-6 sm:w-8 sm:h-8"
                            :alt="h.badge"
                        />
                      </template>
                      <template v-else>
                        <span class="text-neutral-500 italic">None</span>
                      </template>
                    </TableCell>
                  </template>
                </TableRow>
              </template>
            </TableRow>
          </TableBody>

        </Table>
      </div>
    </div>
  </div>
</template>
