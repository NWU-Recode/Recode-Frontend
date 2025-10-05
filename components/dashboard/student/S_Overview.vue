<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApiFetch } from '@/composables/useApiFetch'
import bronzeIcon from '~/assets/flat-icons/bronze.png'
import silverIcon from '~/assets/flat-icons/silver.png'
import goldIcon from '~/assets/flat-icons/gold.png'
import rubyIcon from '~/assets/flat-icons/ruby.png'
import emeraldIcon from '~/assets/flat-icons/emerald.png'
import diamondIcon from '~/assets/flat-icons/diamond.png'

const { apiFetch } = useApiFetch()

// Badge tiers and question counts per challenge
const steps = [
  { step: 1, title: 'Bronze', questions: 2 },
  { step: 2, title: 'Silver', questions: 2 },
  { step: 3, title: 'Gold', questions: 1 },
]

const student = ref({
  full_name: '',
  avatar_url: null,
  email: '',
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
        completedQuestions: ch.questions_correct ?? 0,
        totalQuestions: ch.total_questions ?? 5,
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

onMounted(fetchStudentData)
</script>

<template>
  <div class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
    <div class="my-4 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
      <h2 class="text-3xl sm:text-4xl font-bold text-purple-400">Welcome to Recode,</h2>
      <h2 class="text-3xl sm:text-4xl">TITLE {{ student.full_name }}</h2>
    </div>

    <!-- Student Challenge Progress Cards -->
    <div
        class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    >
      <Card
          v-for="challenge in challenges"
          :key="challenge.challenge_id"
          class="h-auto sm:h-52 sm:min md:h-56 lg:h-60"
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
            <span class="text-sm sm:text-base font-semibold text-center mt-2 sm:mt-0">
              {{ challenge.challenge_name }}
            </span>
          </div>

          <!-- Badge Progress Bar -->
          <div class="mt-2 mb-2 relative flex items-center w-full">
            <!-- Connector Line -->
            <div class="absolute top-8 sm:top-10 left-0 w-full h-1 bg-gray-300 z-0 rounded">
              <div
                  class="h-1 bg-purple-400 rounded"
                  :style="{ width: Math.min((challenge.completedQuestions / challenge.totalQuestions) * 100, 100) + '%' }"
              ></div>
            </div>

            <!-- Badges -->
            <div v-for="(step, index) in steps" :key="step.step" class="relative flex-1 flex justify-center z-10">
              <img
                  class="h-8 w-8 sm:h-10 sm:w-10"
                  :src="index === 0 ? bronzeIcon : index === 1 ? silverIcon : goldIcon"
                  :alt="step.title"
                  :class="challenge.completedQuestions >= steps.slice(0, index + 1).reduce((sum, s) => sum + s.questions, 0) ? 'opacity-100' : 'opacity-80 grayscale'"
              />
            </div>
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
                      class="bg-muted/20"
                  >
                    <template #default>
                      <TableCell />
                      <TableCell colspan="2">{{ challenge.challenge_name }}</TableCell>
                      <TableCell>Week {{ challenge.week_number ?? '-' }}</TableCell>
                      <TableCell>
                        <span>{{ challenge.completedQuestions }} / {{ challenge.totalQuestions }}</span>
                        <span class="ml-6">{{ challenge.challenge_completion_rate }}%</span>
                      </TableCell>
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


