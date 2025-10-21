<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter } from 'vue-router'
import { useApiFetch } from '@/composables/useApiFetch'
import bronzeIcon from '~/assets/flat-icons/bronze.png'
import silverIcon from '~/assets/flat-icons/silver.png'
import goldIcon from '~/assets/flat-icons/gold.png'
import rubyIcon from '~/assets/flat-icons/ruby.png'
import emeraldIcon from '~/assets/flat-icons/emerald.png'
import diamondIcon from '~/assets/flat-icons/diamond.png'
import FunLoader from '~/components/FunLoader.vue'

const { apiFetch } = useApiFetch()
const router = useRouter()

// --- Navigation ---
const goToChallenge = (challenge: any) => {
  localStorage.setItem('currentChallengeId', challenge.challenge_id)
  router.push({
    path: '/coding-challenge',
    state: {
      moduleCode: challenge.moduleCode,
      challengeName: challenge.challenge_name
    }
  })
}

// --- Badge icons ---
const weeklySteps = [
  { step: 1, title: 'Bronze', questions: 2 },
  { step: 2, title: 'Silver', questions: 2 },
  { step: 3, title: 'Gold', questions: 1 },
]
const stepIcons = [bronzeIcon, silverIcon, goldIcon]
const specialIcons: Record<string, string> = {
  ruby: rubyIcon,
  emerald: emeraldIcon,
  diamond: diamondIcon,
}

// --- State ---
const student = ref({
  full_name: '',
  avatar_url: null,
  email: '',
  title_name: '',
})

const semesters = ref<any[]>([])
const currentSemester = ref<any | null>(null)
const modules = ref<any[]>([])
const challenges: any[] = ref([])
const challengesByModule = ref<{ [key: string]: any[] }>({})
const loading = ref(true)
const currentWeek = ref<number | null>(null)

// --- Fetch Semesters ---
async function fetchSemesters() {
  try {
    const res = await apiFetch('/semesters/')
    semesters.value = res
    currentSemester.value = res.find((s: any) => s.is_current)
  } catch (err) {
    console.error('Failed to fetch semesters:', err)
  }
}

// --- Fetch Student Data, Modules & Challenges ---
const fetchStudentData = async () => {
  try {
    loading.value = true

    const profileData = await apiFetch('/student/me/progress')
    student.value = profileData.profile || {}

    // --- Fetch all modules ---
    const modulesData = await apiFetch('/admin/')
    const allModules = Array.isArray(modulesData) ? modulesData : []

    // --- Filter to current semester ---
    const filteredModules = currentSemester.value
        ? allModules.filter((m: any) => m.semester_id === currentSemester.value.id)
        : allModules

    modules.value = filteredModules

    // --- Fetch challenges ---
    const challengesData = await apiFetch('/student/challenges')

    // --- Filter challenges by current semester modules ---
    const validModuleCodes = new Set(filteredModules.map((m: any) => m.code))
    const filteredChallenges = challengesData.filter((ch: any) =>
        validModuleCodes.has(ch.module_code)
    )

    // --- Build map and sorted arrays ---
    const challengesMap: { [key: string]: any[] } = {}
    const flatChallenges: any[] = []

    filteredChallenges.forEach(ch => {
      if (!challengesMap[ch.module_code]) challengesMap[ch.module_code] = []

      const challenge = {
        ...ch,
        completedQuestions: ch.questions_correct ?? (ch.passed ?? 0),
        totalQuestions: ch.total_questions ?? 5,
        type: ch.challenge_type === 'special' ? 'special' : 'weekly',
        tier: ch.tier || (ch.challenge_type === 'special' ? 'emerald' : ''),
      }

      challengesMap[ch.module_code].push(challenge)
      flatChallenges.push({ ...challenge, moduleCode: ch.module_code, moduleName: ch.module_name })
    })

    // --- Sort challenges by week number ---
    for (const mod in challengesMap) {
      challengesMap[mod].sort((a, b) => {
        if (a.week_number == null && b.week_number == null) return 0
        if (a.week_number == null) return 1
        if (b.week_number == null) return -1
        return a.week_number - b.week_number
      })
    }

    flatChallenges.sort((a, b) => {
      if (a.week_number == null && b.week_number == null) return 0
      if (a.week_number == null) return 1
      if (b.week_number == null) return -1
      return a.week_number - b.week_number
    })

    challengesByModule.value = challengesMap
    challenges.value = flatChallenges
  } catch (err) {
    console.error('Error fetching student overview:', err)
  } finally {
    loading.value = false
  }
}

// --- Helpers ---
const challengeProgressPercentage = (challenge: any) =>
    Math.round((challenge.completedQuestions / challenge.totalQuestions) * 100)

const moduleProgress = (modCode: string) => {
  const chs = challengesByModule.value[modCode] || []
  if (!chs.length) return 0
  const total = chs.length
  const completed = chs.filter(ch => ch.challenge_completion_rate >= 100).length
  return Math.round((completed / total) * 100)
}

const challengeStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return { label: 'Closed', color: 'green' }
    case 'active':
      return { label: 'Active', color: 'blue' }
    case 'draft':
      return { label: 'Not active', color: 'red' }
    default:
      return { label: 'Unknown', color: 'gray' }
  }
}

// --- Fetch Current Week ---
async function fetchCurrentWeek() {
  try {
    const res = await apiFetch('/dashboard/current-week')
    currentWeek.value = res?.current_week ?? null
  } catch (err) {
    console.error('Failed to fetch current week:', err)
    currentWeek.value = null
  }
}

onMounted(async () => {
  await fetchSemesters()
  await fetchStudentData()
  await fetchCurrentWeek()
})
</script>

<template>
  <FunLoader v-if="loading" />
  <div v-else class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
    <div class="my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
      <!-- Left: Welcome -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <h2 class="text-3xl sm:text-4xl font-bold text-purple-400">Welcome to Recode,</h2>
        <h2 class="text-3xl sm:text-4xl">{{ student.title_name }} {{ student.full_name }}</h2>
      </div>

      <!-- Right: Current Week -->
      <div class="text-right text-xl sm:text-2xl font-semibold text-neutral-700">
        Current Week: <span v-if="currentWeek">{{ currentWeek }}</span><span v-else>N/A</span>
      </div>
    </div>

    <!-- Student Challenge Progress Cards -->
    <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card
          v-for="challenge in challenges"
          :key="challenge.challenge_id"
          class="h-56 sm:h-60 md:h-64 lg:h-68 flex flex-col cursor-pointer"
          @click="goToChallenge(challenge)"
      >
        <CardContent class="flex flex-col h-full p-4">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between">
            <div class="flex flex-col">
              <span class="text-sm">{{ challenge.moduleCode }}</span>
              <span v-if="challenge.week_number != null" class="text-xs text-neutral-500">
                Week: {{ challenge.week_number }}
              </span>
              <span class="flex items-center mt-1 text-xs text-neutral-500">
              <span
                  class="w-2 h-2 rounded-full shadow-lg animate-pulse mr-2"
                  :class="`bg-${challengeStatusLabel(challenge.challenge_status).color}-500`"
              ></span>
                {{ challengeStatusLabel(challenge.challenge_status).label }}
              </span>
            </div>
            <span
                class="text-xs sm:text-sm font-semibold mt-2 sm:mt-0 break-words sm:max-w-[50%]"
            >
              {{ challenge.challenge_name }}
            </span>
          </div>

          <!-- Spacer to push progress bar and badges down -->
          <div class="flex-1"></div>

          <!-- Badge Progress Bar -->
          <div class="relative flex items-center w-full mt-2 mb-2">
            <!-- Connector Line -->
            <div class="absolute top-8 sm:top-10 left-0 w-full h-1 bg-neutral-300 z-0 rounded">
              <div
                  class="h-1 bg-purple-400 rounded"
                  :style="{
              width: challenge.type === 'weekly'
                ? Math.min((challenge.completedQuestions / challenge.totalQuestions) * 100, 100) + '%'
                : (challenge.completedQuestions >= 1 ? '100%' : '0%')
            }"
              ></div>
            </div>

            <!-- Weekly Badges -->
            <template v-if="challenge.type === 'weekly'">
              <div
                  v-for="(step, index) in weeklySteps"
                  :key="step.step"
                  class="relative flex-1 flex justify-center z-10"
              >
                <img
                    class="h-8 w-8 sm:h-10 sm:w-10"
                    :src="stepIcons[index]"
                    :alt="step.title"
                    :class="challenge.completedQuestions >= weeklySteps.slice(0, index + 1).reduce((sum, s) => sum + s.questions, 0)
                ? 'opacity-100'
                : 'opacity-80 grayscale'"
                />
              </div>
            </template>

            <!-- Special Badge -->
            <template v-else>
              <div class="relative flex-1 flex justify-end z-10">
                <img
                    class="h-8 w-8 sm:h-10 sm:w-10"
                    :src="specialIcons[challenge.tier]"
                    :alt="challenge.tier"
                    :class="challenge.completedQuestions >= 1 ? 'opacity-100' : 'opacity-80 grayscale'"
                />
              </div>
            </template>
          </div>

          <!-- Progress Text -->
          <div class="mt-2 text-sm text-neutral-500 break-words">
            {{ challenge.completedQuestions }} / {{ challenge.totalQuestions }} questions completed
            ({{ challengeProgressPercentage(challenge) }}%)
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modules & Challenges Table -->
    <div class="mt-8 w-full max-w-[370px] sm:max-w-full overflow-x-auto rounded-lg shadow">
      <div class="inline-block min-w-full">
        <div>
          <Table class="table-auto w-full">
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Module Code</TableHead>
                <TableHead>Module Name</TableHead>
                <TableHead>Challenges Count</TableHead>
                <TableHead>Progress %</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-for="mod in modules" :key="mod.id" collapsible>
                <template #default>
                  <TableCell>{{ mod.code }}</TableCell>
                  <TableCell>{{ mod.name }}</TableCell>
                  <TableCell>{{ challengesByModule[mod.code]?.length || 0 }}</TableCell>
                  <TableCell>{{ challengesByModule[mod.code] ? moduleProgress(mod.code) + '%' : '—' }}</TableCell>
                </template>

                <template #expanded>
                  <TableRow
                      v-for="challenge in challengesByModule[mod.code] || []"
                      :key="challenge.challenge_id"
                      class="bg-muted/20 hover:bg-muted/40 cursor-pointer"
                  >
                    <template #default>
                      <div class="contents" @click="goToChallenge(challenge)">
                        <TableCell />
                        <TableCell colspan="2">{{ challenge.challenge_name }}</TableCell>
                        <TableCell>
                          Open: {{ new Date(challenge.release_date).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) }}
                        </TableCell>
                        <TableCell>
                          Due: {{ new Date(challenge.due_date).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) }}
                        </TableCell>
                      </div>
                    </template>
                  </TableRow>
                </template>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Responsive card heights */
.h-48 { height: 12rem; }
.h-52 { height: 13rem; }
.h-56 { height: 14rem; }
.h-60 { height: 15rem; }
</style>
