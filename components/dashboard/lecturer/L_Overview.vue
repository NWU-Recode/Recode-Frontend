<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { ChevronLeft, ChevronRight, Send, BookOpenText, CodeXml, Brain } from 'lucide-vue-next'
import { Card, CardContent } from '~/components/ui/card'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { useApiFetch } from '@/composables/useApiFetch'
import bronzeIcon from '~/assets/flat-icons/bronze.png'
import silverIcon from '~/assets/flat-icons/silver.png'
import goldIcon from '~/assets/flat-icons/gold.png'
import emeraldIcon from '~/assets/flat-icons/emerald.png'
import rubyIcon from '~/assets/flat-icons/ruby.png'
import diamondIcon from '~/assets/flat-icons/diamond.png'
import FunLoader from '~/components/FunLoader.vue'

const isLoading = ref(true)

const { apiFetch } = useApiFetch()

// --- User info ---
const lecturer = ref<{ full_name: string }>({ full_name: '' })

// --- Semesters ---
const currentSemester = ref<any>(null)

// --- Modules & Challenges ---
const modules = ref<any[]>([])
const cards = ref<any[]>([]) // challenge progress cards

const challengeOptions = ref<any[]>([])
const selectedChallengeId = ref<string | null>(null)

const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)

// --- Monaco Editor ---
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor
const selectedLanguage = 'python'

const currentWeek = ref<number | null>(null)

async function fetchCurrentSemester() {
  try {
    const res = await apiFetch('/semesters/')
    currentSemester.value = res.find((s: any) => s.is_current) || null
  } catch (err) {
    console.error('Failed to fetch semesters:', err)
  }
}

async function fetchCurrentWeek() {
  try {
    const res = await apiFetch('/dashboard/current-week')
    currentWeek.value = res?.current_week ?? null
  } catch (err) {
    console.error('Failed to fetch current week:', err)
    currentWeek.value = null
  }
}

// --- Fetch current lecturer ---
async function fetchLecturer() {
  try {
    const res = await apiFetch('/admin/me')
    lecturer.value = res
  } catch (err) {
    console.error('Failed to fetch lecturer profile:', err)
  }
}

// --- Fetch modules ---
async function fetchModules() {
  try {
    const res = await apiFetch('/admin/')
    modules.value = currentSemester.value
        ? res.filter((m: any) => m.semester_id === currentSemester.value.id)
        : res
  } catch (err) {
    console.error('Failed to fetch modules:', err)
  }
}

// --- Fetch challenge progress (cards) ---
async function fetchCards() {
  try {
    const res = await apiFetch('/analytics/challenge/progress')

    const filtered = currentSemester.value
        ? res.filter((c: any) => {
          const module = modules.value.find(m => m.code === c.module_code)
          return module && module.semester_id === currentSemester.value.id
        })
        : res

    const sorted = filtered
        .map((c: any) => {
          let icons: string[] = []
          let percentages: number[] = []

          if (c.challenge_type.toLowerCase() === 'weekly') {
            icons = [bronzeIcon, silverIcon, goldIcon]
            percentages = [
              c.difficulty_breakdown?.bronze ?? c.challenge_completion_rate,
              c.difficulty_breakdown?.silver ?? c.challenge_completion_rate,
              c.difficulty_breakdown?.gold ?? c.challenge_completion_rate,
            ]
          } else if (c.challenge_type.toLowerCase() === 'special') {
            const tierIconMap: Record<string, string> = {
              emerald: emeraldIcon,
              ruby: rubyIcon,
              diamond: diamondIcon,
            }
            const tier = c.challenge_tier?.toLowerCase() || 'emerald'
            icons = [tierIconMap[tier] || emeraldIcon]
            percentages = [c.challenge_completion_rate]
          }

          return {
            id: c.challenge_id,
            topic: c.challenge_name,
            module_code: c.module_code,
            icons,
            percentages,
            week_number: c.week_number,
            participation_rate: c.challenge_participation_rate,
          }
        })
        .sort((a, b) => {
          if (a.week_number == null && b.week_number == null) return 0
          if (a.week_number == null) return 1
          if (b.week_number == null) return -1
          return a.week_number - b.week_number
        })

    cards.value = sorted
  } catch (err) {
    console.error('Failed to fetch challenge progress:', err)
  }
}

// --- Fetch challenges (dropdown list) ---
async function fetchChallenges() {
  try {
    const res = await apiFetch('/analytics/challenge/progress')

    const filtered = currentSemester.value
        ? res.filter((c: any) => {
          const module = modules.value.find(m => m.code === c.module_code)
          return module && module.semester_id === currentSemester.value.id
        })
        : res

    const sorted = filtered
        .map((c: any) => ({
          id: c.challenge_id,
          title: c.challenge_name,
          module_code: c.module_code,
          week_number: c.week_number,
        }))
        .sort((a, b) => {
          if (a.week_number == null && b.week_number == null) return 0
          if (a.week_number == null) return 1
          if (b.week_number == null) return -1
          return a.week_number - b.week_number
        })

    challengeOptions.value = sorted
  } catch (err) {
    console.error('Failed to fetch challenges', err)
  }
}

async function fetchQuestionsForChallenge(challengeId: string) {
  try {
    const data = await apiFetch(`/challenges/${challengeId}/questions`)
    questions.value = data.items || []
    if (!questions.value.length && editor) editor.setValue('')
    currentQuestionIndex.value = 0
    if (questions.value.length) loadCurrentQuestionIntoEditor()
  } catch (err) {
    console.error('Failed to load questions', err)
    questions.value = []
    if (editor) editor.setValue('')
  }
}

const testcases = ref<{ input: string; expected: string }[]>([])

async function fetchTestcases(challengeId: string, questionId: string) {
  try {
    const data = await apiFetch(`/submissions/challenges/${challengeId}/questions/${questionId}/bundle`)
    testcases.value = data.tests?.map((t: any) => ({
      input: t.input,
      expected: t.expected,
    })) || []
  } catch (err) {
    console.error('Failed to fetch testcases:', err)
    testcases.value = []
  }
}

function formatInput(value: string) {
  return value ? value.trim().split('\n') : []
}

async function fetchAllData() {
  isLoading.value = true
  try {
    await fetchCurrentSemester()
    await fetchLecturer()
    await fetchModules()
    await Promise.all([
      fetchChallenges(),
      fetchCards(),
      fetchCurrentWeek(),
    ])
  } catch (err) {
    console.error('Failed to fetch overview data:', err)
  } finally {
    isLoading.value = false
  }
}

// --- Lifecycle ---
onMounted(() => {
  fetchAllData()

  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: '',
      language: selectedLanguage,
      theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light',
      automaticLayout: true,
      readOnly: true,
    })
  }
})

watch(selectedChallengeId, (id) => {
  // ✅ Clear old data before loading new challenge
  questions.value = []
  currentQuestionIndex.value = 0
  if (editor) editor.setValue('')

  if (id) fetchQuestionsForChallenge(id)
})

// --- Current Question ---
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

// --- Navigation ---
function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) currentQuestionIndex.value++
  loadCurrentQuestionIntoEditor()
}
function prevQuestion() {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value--
  loadCurrentQuestionIntoEditor()
}

// --- Load code into Monaco ---
function loadCurrentQuestionIntoEditor() {
  if (!editor || !currentQuestion.value || !selectedChallengeId.value) return

  // Load starter code
  const code = currentQuestion.value.starter_code || ''
  editor.setValue(code)

  // Fetch testcases for this question
  fetchTestcases(selectedChallengeId.value, currentQuestion.value.id)
}
</script>

<template>
  <FunLoader v-if="isLoading" />
  <div v-else class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400">
        Welcome, {{ lecturer.full_name }}
      </h2>

      <div class="text-right text-xl sm:text-2xl font-semibold text-neutral-700">
        Current Week: <span v-if="currentWeek">{{ currentWeek }}</span><span v-else>N/A</span>
      </div>
    </div>

    <!-- Challenge Progress Cards -->
    <div
        class="grid gap-4 sm:gap-6"
        style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))"
    >
      <Card
          v-for="card in cards"
          :key="card.id"
          class="h-56 sm:h-60 md:h-64 lg:h-68 flex flex-col"
      >
        <CardContent class="flex flex-col h-full p-4">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between">
            <div class="flex flex-col">
              <span class="text-sm">{{ card.module_code }}</span>
              <span v-if="card.week_number != null" class="text-xs text-neutral-500">
            Week: {{ card.week_number }}
          </span>
            </div>
            <span
                class="text-xs sm:text-sm font-semibold text-center mt-2 sm:mt-0 break-words sm:max-w-[50%]"
            >
          {{ card.topic }}
        </span>
          </div>

          <!-- Spacer to push icons to bottom -->
          <div class="flex-1"></div>

          <!-- Icons row -->
          <div
              class="mt-2 flex flex-wrap gap-4"
              :class="card.icons.length === 1 ? 'justify-center' : 'justify-between'"
          >
            <div
                v-for="(icon, i) in card.icons"
                :key="i"
                class="flex flex-col items-center gap-1"
            >
              <img :src="icon" class="h-10 w-10" />
              <span class="text-sm font-semibold">{{ card.percentages[i] }}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Dropdown & Navigation -->
    <div class="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <!-- Challenge Dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger
            class="w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm flex items-center justify-between text-sm sm:text-base whitespace-normal break-words"
        >
          {{ selectedChallengeId ? challengeOptions.find(c => c.id === selectedChallengeId)?.title : 'Select challenge' }}
        </DropdownMenuTrigger>

        <DropdownMenuContent
            class="max-w-xs w-full break-words max-h-64 overflow-y-auto"
        >
          <DropdownMenuItem
              v-for="challenge in challengeOptions"
              :key="challenge.id"
              @click="selectedChallengeId = challenge.id"
              class="whitespace-normal"
          >
            <div class="flex flex-col">
              <span class="font-semibold">{{ challenge.title }}</span>
              <span class="text-xs text-neutral-500">{{ challenge.module_code }} - Week {{ challenge.week_number}}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Question Navigation -->
      <div class="flex flex-wrap sm:flex-nowrap justify-end gap-2 items-center">
        <Button
            variant="outline"
            :leftIcon="ChevronLeft"
            :disabled="currentQuestionIndex === 0"
            @click="prevQuestion"
        >
          Previous
        </Button>
        <span class="p-2">
          Question {{ currentQuestionIndex + 1 }}
        </span>
        <Button
            variant="outline"
            :rightIcon="ChevronRight"
            :disabled="currentQuestionIndex >= questions.length - 1"
            @click="nextQuestion"
        >
          Next
        </Button>
        <Button variant="outline" :leftIcon="Send" disabled>
          Submit
        </Button>
      </div>
    </div>

    <!-- Description / Code / Testcases -->
    <div
        class="grid gap-4 sm:gap-6"
        style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))"
    >
      <!-- Description -->
      <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow min-h-[200px] max-h-[400px]">
        <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          <BookOpenText class="w-5 h-5 text-pink-400" />
          <span>Description</span>
        </div>

        <div class="flex-1 overflow-auto">
          <div v-if="selectedChallengeId">
            <template v-if="questions.length > 0 && currentQuestion">
              <p class="whitespace-pre-wrap text-neutral-800 dark:text-neutral-100">
                {{ currentQuestion.question_text || currentQuestion.prompt || 'No description available' }}
              </p>
            </template>

            <template v-else>
              <p class="text-neutral-500">
                No challenge data yet.
              </p>
            </template>
          </div>

          <div v-else class="text-neutral-500">
            Please select a challenge to view details.
          </div>
        </div>
      </div>

        <!-- Code editor -->
      <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow min-h-[200px]  max-h-[400px]">
        <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          <CodeXml class="w-5 h-5 text-pink-400" />
          <span>Code</span>
        </div>
        <div ref="editorContainer" class="flex-1 overflow-auto rounded-md"></div>
      </div>

      <!-- Testcases -->
      <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow min-h-[200px] max-h-[400px]">
        <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          <Brain class="w-5 h-5 text-pink-400" />
          <span>Testcases</span>
        </div>

        <div class="flex-1 overflow-auto">
          <div v-if="selectedChallengeId && cards.length > 0">
            <div v-if="testcases.length > 0" class="space-y-2">
              <div
                  v-for="(tc, idx) in testcases"
                  :key="idx"
                  class="p-2 border rounded-md"
              >
                <!-- Two-column layout -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <!-- Input -->
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">
                    <span class="font-bold">Input:</span>
                    <div class="ml-2 mt-1 space-y-0.5">
                      <div
                          v-for="(line, i) in formatInput(tc.input)"
                          :key="'in-' + i"
                          class="font-mono"
                      >
                        {{ line }}
                      </div>
                    </div>
                  </div>

                  <!-- Expected -->
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">
                    <span class="font-bold">Expected:</span>
                    <div class="ml-2 mt-1 space-y-0.5">
                      <div
                          v-for="(line, i) in formatInput(tc.expected)"
                          :key="'ex-' + i"
                          class="font-mono"
                      >
                        {{ line }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-neutral-500 text-sm">
              No testcases available for this question.
            </div>
          </div>

          <div v-else class="text-neutral-500 text-sm">
            Select a challenge to view its testcases.
          </div>
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


