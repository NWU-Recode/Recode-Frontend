<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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

const { apiFetch } = useApiFetch()
const { user, isAuthenticated, fetchUser } = useAuth()
const token = ref<string | null>(null)

async function initAuth() {
  if (!isAuthenticated.value) {
    const u = await fetchUser()
    if (!u) return
  }
  token.value = localStorage.getItem('access_token')
}
await initAuth()

// --- Modules ---
const modules = ref<any[]>([])
const selectedModuleCode = ref<string | null>(null)

// --- Students per module ---
const studentsByModule = reactive<Record<string, any[]>>({})

// --- Challenge selection (optional) ---
const challenges = ref<any[]>([])
const selectedChallengeId = ref<string | null>(null)
const selectedChallenge = computed(() =>
    challenges.value.find(c => c.challenge_id === selectedChallengeId)
)

// --- Top cards derived from selected challenge ---
const submissionsPercentage = computed(() =>
    selectedChallenge?.value?.challenge_participation_rate ?? 0
)
const avgElo = computed(() => selectedChallenge?.value?.avg_elo_of_successful_students ?? 0)
const avgCompletionTime = computed(() => selectedChallenge?.value?.avg_completion_time_minutes ?? 0)

// --- Badge image mapping ---
const badgeImages: Record<string, string> = {
  none: Bronze, // fallback
  Bronze,
  Silver,
  Gold,
  Ruby,
  Emerald,
  Diamond,
}

// --- Fetch modules ---
async function fetchModules() {
  if (!token.value) await initAuth()
  if (!token.value) return

  try {
    const res = await apiFetch('/admin/', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    modules.value = res
  } catch (err) {
    console.error('Failed to fetch modules', err)
  }
}

// --- Fetch student progress for a module ---
async function fetchChallengeProgress(moduleCode: string) {
  if (!token.value) await initAuth()
  if (!token.value) return

  try {
    const res = await apiFetch(`/challenge-progress?module_code=${moduleCode}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    const studentMap: Record<string, any> = {}
    res.forEach((entry: any) => {
      const badge = entry.highest_badge || 'none'

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

// --- Watch selected module to refresh students ---
watch(selectedModuleCode, async (val) => {
  if (!val) return
  await fetchChallengeProgress(val)
})

onMounted(async () => {
  await fetchModules()
})
</script>

<template>
  <div class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">

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
              <span class="text-xs text-gray-500">{{ mod.code }}</span>
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
    <div class="h-64 sm:h-80 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex items-center justify-center shadow">
      <span class="text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Graph / analytics will go here
      </span>
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
                v-for="student in studentsByModule[selectedModuleCode] || []"
                :key="student.number"
                collapsible
            >
              <!-- Main row: only name & number -->
              <template #default>
                <TableCell>{{ student.number }}</TableCell>
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
                      <img
                          :src="badgeImages[h.badge]"
                          class="w-6 h-6 sm:w-8 sm:h-8"
                          :alt="h.badge"
                      />
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
