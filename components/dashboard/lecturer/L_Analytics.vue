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

// --- Dropdown & challenge data ---
const challenges = ref<any[]>([])
const selectedChallengeId = ref<string | null>(null)
const selectedChallenge = computed(() =>
    challenges.value.find(c => c.challenge_id === selectedChallengeId)
)

// --- Cards data derived from selected challenge ---
const submissionsPercentage = computed(() =>
    selectedChallenge?.value?.challenge_participation_rate ?? 0
)
const avgElo = computed(() => selectedChallenge?.value?.avg_elo_of_successful_students ?? 0)
const avgCompletionTime = computed(() => selectedChallenge?.value?.avg_completion_time_minutes ?? 0)

// --- Badge image mapping ---
const badgeImages: Record<string, string> = {
  Bronze,
  Silver,
  Gold,
  Ruby,
  Emerald,
  Diamond,
}

// --- Static table for now ---
const topics = ['If Statements', 'Else Statements', 'While Loops', 'Do-While Loops']
const submissionsList = [
  { name: "John Doe", number: "31765387", topic: "If Statements", badge: "Bronze", time: "10 min" },
  { name: "Jane Doe", number: "45609312", topic: "If Statements", badge: "Gold", time: "2.3 hours" },
]
const students = submissionsList.map(s => ({
  ...s,
  history: topics.filter(t => t !== s.topic).map((topic, i) => ({
    topic,
    badge: ["Bronze", "Silver", "Gold", "Ruby"][i % 4],
    time: ["15 min", "1.2 hours", "30 min", "3.5 hours"][i % 4],
  }))
}))

// --- Fetch challenge progress ---
async function fetchChallenges() {
  try {
    const res = await apiFetch('/challenges/progress')
    challenges.value = res
  } catch (err) {
    console.error('Failed to fetch challenges:', err)
  }
}

onMounted(() => {
  fetchChallenges()
})
</script>

<template>
  <div class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
    <!-- Dropdown -->
    <div class="w-full max-w-sm">
      <DropdownMenu>
        <DropdownMenuTrigger
            class="w-full px-4 py-2 border rounded-md shadow-sm flex items-center justify-between text-sm sm:text-base"
        >
          {{ selectedChallenge ? selectedChallenge.challenge_name : 'Select a challenge' }}
        </DropdownMenuTrigger>

        <!-- Wrap dropdown content so long items wrap instead of stretching the page -->
        <DropdownMenuContent
            class="w-full max-w-xs break-words"
            style="white-space: normal;"
        >
          <DropdownMenuItem
              v-for="c in challenges"
              :key="c.challenge_id"
              @click="selectedChallengeId = c.challenge_id"
              class="whitespace-normal"
          >
            <div class="flex flex-col">
              <span class="font-semibold text-sm sm:text-base break-words">{{ c.challenge_name }}</span>
              <span class="text-xs sm:text-sm text-gray-500 break-words">{{ c.module_code }}</span>
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
    <div
        class="h-64 sm:h-80 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex items-center justify-center shadow"
    >
      <span class="text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Graph / analytics will go here
      </span>
    </div>

    <!-- Table container: scroll only inside -->
    <div class="w-full max-w-[370px] sm:max-w-full overflow-x-auto rounded-lg shadow">
      <!-- Inner wrapper ensures table does not push the page -->
      <div class="inline-block min-w-full">
        <Table class="table-auto w-full">
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Student Name</TableHead>
              <TableHead>Student Number</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Time Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="student in students" :key="student.number" collapsible>
              <template #default>
                <TableCell>{{ student.name }}</TableCell>
                <TableCell>{{ student.number }}</TableCell>
                <TableCell>{{ student.topic }}</TableCell>
                <TableCell>
                  <img
                      :src="badgeImages[student.badge]"
                      class="w-6 h-6 sm:w-8 sm:h-8"
                      :alt="student.badge"
                  />
                </TableCell>
                <TableCell>{{ student.time }}</TableCell>
              </template>
              <template #expanded>
                <TableRow v-for="(h, i) in student.history" :key="i" class="bg-muted/20">
                  <template #default>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell>{{ h.topic }}</TableCell>
                    <TableCell>
                      <img
                          :src="badgeImages[h.badge]"
                          class="w-6 h-6 sm:w-8 sm:h-8"
                          :alt="h.badge"
                      />
                    </TableCell>
                    <TableCell>{{ h.time }}</TableCell>
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
