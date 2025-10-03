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

const { apiFetch } = useApiFetch()

const router = useRouter()

const goToChallenge = (challenge: any) => {
  // Store challengeId (and maybe module/week) so coding challenge view can fetch questions
  localStorage.setItem('currentChallengeId', challenge.challenge_id)

  // Navigate to coding challenge view
  router.push('/coding-challenge')
}

// Badge tiers and question counts per weekly challenge
const weeklySteps = [
  { step: 1, title: 'Bronze', questions: 2 },
  { step: 2, title: 'Silver', questions: 2 },
  { step: 3, title: 'Gold', questions: 1 },
]

const stepIcons = [bronzeIcon, silverIcon, goldIcon]

// Map for special challenge icons by tier
const specialIcons: Record<string, string> = {
  ruby: rubyIcon,
  emerald: emeraldIcon,
  diamond: diamondIcon,
}

const student = ref({
  full_name: '',
  avatar_url: null,
  email: '',
  title_name: '',
})

const modules = ref<any[]>([])
const challenges: any[] = ref([])
const challengesByModule = ref<{ [key: string]: any[] }>({})
const loading = ref(true)

// Fetch student data, modules, and challenges
const fetchStudentData = async () => {
  try {
    loading.value = true

    const profileData = await apiFetch('/student/me/progress')
    student.value = profileData.profile || {}

    const modulesData = await apiFetch('/admin/')
    modules.value = Array.isArray(modulesData) ? modulesData : []

    const challengesData = await apiFetch('/student/challenges')
    const challengesMap: { [key: string]: any[] } = {}
    const flatChallenges: any[] = []

    challengesData.forEach(ch => {
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

    challengesByModule.value = challengesMap
    challenges.value = flatChallenges
  } catch (err) {
    console.error('Error fetching student overview:', err)
  } finally {
    loading.value = false
  }
}

// Compute total questions completed in a challenge
const challengeProgressPercentage = (challenge: any) => {
  return Math.round((challenge.completedQuestions / challenge.totalQuestions) * 100)
}

// Module-level progress
const moduleProgress = (modCode: string) => {
  const challenges = challengesByModule.value[modCode] || []
  if (!challenges.length) return 0
  const total = challenges.length
  const completed = challenges.filter(ch => ch.challenge_completion_rate >= 100).length
  return Math.round((completed / total) * 100)
}

const currentWeek = ref<number | null>(null)

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
  await fetchStudentData()
  await fetchCurrentWeek()
})
</script>

<template>
  <div class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
    <div class="my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
      <!-- Left: Welcome -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <h2 class="text-3xl sm:text-4xl font-bold text-purple-400">Welcome to Recode,</h2>
        <h2 class="text-3xl sm:text-4xl">{{ student.title_name }} {{ student.full_name }}</h2>
      </div>

      <!-- Right: Current Week -->
      <div class="text-right text-xl sm:text-2xl font-semibold text-gray-700">
        Current Week: <span v-if="currentWeek">{{ currentWeek }}</span><span v-else>N/A</span>
      </div>
    </div>

    <!-- Student Challenge Progress Cards -->
    <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card
          v-for="challenge in challenges"
          :key="challenge.challenge_id"
          class="h-auto sm:h-52 sm:min md:h-56 lg:h-60"
          @click="goToChallenge(challenge)"
      >
        <CardContent class="h-full flex flex-col justify-center p-4">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
            <div class="flex flex-col">
              <span class="text-sm">{{ challenge.moduleCode }}</span>
              <span v-if="challenge.week_number != null" class="text-xs text-gray-500">
                Week: {{ challenge.week_number }}
              </span>
            </div>
            <span class="text-sm sm:text-base font-semibold text-center ml-2 sm:mt-0">
              {{ challenge.challenge_name }}
            </span>
          </div>

          <!-- Badge Progress Bar -->
          <div class="mt-2 mb-2 relative flex items-center w-full">
            <!-- Connector Line -->
            <div class="absolute top-8 sm:top-10 left-0 w-full h-1 bg-gray-300 z-0 rounded">
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
          <div class="mt-2 text-sm text-gray-700 break-words">
            {{ challenge.completedQuestions }} / {{ challenge.totalQuestions }} questions completed
            ({{ challengeProgressPercentage(challenge) }}%)
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modules & Challenges Table -->
    <div class="mt-8 w-full max-w-[370px] sm:max-w-full overflow-x-auto rounded-lg shadow">
      <div class="inline-block min-w-full">
        <div v-if="!loading">
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
                        <TableCell>Week {{ challenge.week_number ?? '-' }}</TableCell>
                        <TableCell>
                          <span>{{ challenge.completedQuestions }} / {{ challenge.totalQuestions }}</span>
                          <span class="ml-6">{{ challenge.challenge_completion_rate }}%</span>
                        </TableCell>
                      </div>
                    </template>
                  </TableRow>

                </template>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div v-else class="text-center py-10">Loading student data...</div>
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
