<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import { useApiFetch } from '@/composables/useApiFetch'
import { ChevronLeft, ChevronRight, Timer, BugPlay, Send, BookOpenText, NotebookPen, CodeXml, CircleCheck } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const { apiFetch } = useApiFetch()

// --- State ---
const challengeInfo = ref<{ moduleCode?: string; challengeName?: string }>({})
const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const loading = ref(true)

// --- Notes per question ---
const questionNotes = ref<string[]>([])
watch(currentQuestionIndex, (idx) => {
  if (questionNotes.value[idx] === undefined) questionNotes.value[idx] = ''
})

// --- Code per question ---
const questionCode = ref<string[]>([])

// --- Timer per question ---
const elapsedSecondsPerQuestion = ref<number[]>([])
const timerRunning = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null

watch(currentQuestionIndex, (newIdx, oldIdx) => {
  if (!editor) return

  // Save previous question's code
  if (oldIdx !== undefined) saveCurrentCode()
  saveCurrentTime()
  stopTimer()

  // Initialize elapsedSeconds if needed
  if (!elapsedSecondsPerQuestion.value[newIdx]) elapsedSecondsPerQuestion.value[newIdx] = 0
  elapsedSeconds.value = elapsedSecondsPerQuestion.value[newIdx]

  // Load the new question code
  const codeToLoad = questionCode.value[newIdx] || currentQuestion.value?.starter_code || ''
  editor.setValue(normalizeSourceCode(codeToLoad))
})

// --- Timer reactive for current question ---
const elapsedSeconds = ref(0)

// --- Helper to normalize source code ---
function normalizeSourceCode(code: string) {
  return code.trim().replace(/\r\n|\r/g, "\n").replace(/\n{2,}/g, "\n")
}

// --- Language map ---
const selectedLanguage = 'python'

// --- Monaco ---
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: '',
      language: selectedLanguage,
      theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light',
      automaticLayout: true,
    })
  }

  if (window.history.state) {
    const state = window.history.state
    challengeInfo.value.moduleCode = state.moduleCode
    challengeInfo.value.challengeName = state.challengeName
  }

  fetchQuestions()
})

// --- Fetch questions ---
async function fetchQuestions() {
  try {
    const challengeId = localStorage.getItem('currentChallengeId')
    if (!challengeId) return

    const data = await apiFetch(`/challenges/${challengeId}/questions`)
    questions.value = data.items || []

    questions.value.forEach((q, idx) => {
      questionCode.value[idx] = q.starter_code ?? ''
      elapsedSecondsPerQuestion.value[idx] = 0
      if (questionNotes.value[idx] === undefined) questionNotes.value[idx] = ''
    })

    if (questions.value.length > 0) {
      currentQuestionIndex.value = 0
      loadCurrentQuestionIntoEditor()
    }
  } catch (err) {
    console.error('Failed to load questions', err)
  } finally {
    loading.value = false
  }
}

// --- Current Question Computed ---
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

// --- Navigation ---
function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    loadCurrentQuestionIntoEditor()
  }
}
function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    loadCurrentQuestionIntoEditor()
  }
}

// --- Save/Load helpers ---
function saveCurrentCode() {
  if (!editor) return
  questionCode.value[currentQuestionIndex.value] = editor.getValue()
}

function loadCurrentQuestionIntoEditor() {
  if (!editor || !currentQuestion.value) return
  const starterCode = currentQuestion.value.starter_code ?? ''
  questionCode.value[currentQuestionIndex.value] = starterCode
  editor.setValue(normalizeSourceCode(starterCode))
  nextTick(() => editor?.layout())
}

// --- Timer helpers ---
function saveCurrentTime() {
  elapsedSecondsPerQuestion.value[currentQuestionIndex.value] = elapsedSeconds.value
}

function toggleTimer() {
  if (timerRunning.value) stopTimer()
  else startTimer()
}

function startTimer() {
  timerRunning.value = true
  timerInterval = setInterval(() => { elapsedSeconds.value++ }, 1000)
}

function stopTimer() {
  timerRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const formattedTime = computed(() => {
  const h = Math.floor(elapsedSeconds.value / 3600)
  const m = Math.floor((elapsedSeconds.value % 3600) / 60)
  const s = elapsedSeconds.value % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
})

// --- Submit ---
async function handleSubmit() {
  if (!editor) return
  saveCurrentCode()
  saveCurrentTime()
  const challengeId = currentQuestion.value?.challenge_id || localStorage.getItem('currentChallengeId')
  if (!challengeId) return

  if (currentQuestionIndex.value < questions.value.length - 1) {
    nextQuestion()
    return
  }

  const submissions: Record<string, string> = {}
  questions.value.forEach((q, idx) => { submissions[q.id] = normalizeSourceCode(questionCode.value[idx] || '') })

  try { await apiFetch(`/submissions/challenges/${challengeId}/submit-challenge`, { method: 'POST', body: { submissions } }) }
  catch (err) { console.error('Submission failed', err) }
}

const submitButtonLabel = computed(() => currentQuestionIndex.value === questions.value.length - 1 ? 'Submit Challenge' : 'Save')

// --- UI state ---
const showDescription = ref(true)
const showNotes = ref(false)
const section2Height = ref(60)
const section3Height = ref(40)

// --- Divider Drag Logic ---
let startY = 0
let startSection2Height = 0
let startSection3Height = 0
let isDragging = false

function onMouseDown(e: MouseEvent) {
  isDragging = true
  startY = e.clientY
  startSection2Height = section2Height.value
  startSection3Height = section3Height.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging) return
  const container = document.querySelector('.w-2\\/3.flex.flex-col') as HTMLElement
  if (!container) return
  const containerHeight = container.clientHeight
  const deltaY = e.clientY - startY
  const deltaPercent = (deltaY / containerHeight) * 100

  let newSection2Height = startSection2Height + deltaPercent
  let newSection3Height = startSection3Height - deltaPercent

  newSection2Height = Math.max(10, Math.min(90, newSection2Height))
  newSection3Height = Math.max(10, Math.min(90, newSection3Height))

  section2Height.value = newSection2Height
  section3Height.value = newSection3Height

  nextTick(() => editor?.layout())
}

function onMouseUp() {
  isDragging = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}
</script>


<template>
  <div class="flex w-full h-screen">
    <div class="flex-1 flex flex-col">
      <!-- Challenge Info -->
      <div class="mb-4 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 shadow flex flex-col sm:flex-row justify-between items-center">
        <div class="flex flex-col sm:flex-row gap-4">
          <span class="font-semibold text-purple-400">Module:</span>
          <span>{{ challengeInfo.moduleCode || '—' }}</span>

          <span class="font-semibold text-purple-400 ml-4">Challenge:</span>
          <span>{{ challengeInfo.challengeName || '—' }}</span>
        </div>
      </div>


      <!-- Top Buttons -->
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-2">
          <span>Question {{ currentQuestion?.question_number || currentQuestionIndex + 1 }}</span>
          <Button variant="outline" :leftIcon="ChevronLeft" :disabled="currentQuestionIndex === 0" @click="prevQuestion">
            Previous
          </Button>
          <Button variant="outline" :rightIcon="ChevronRight" :disabled="currentQuestionIndex === questions.length - 1" @click="nextQuestion">
            Next
          </Button>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="ghost" :leftIcon="Timer" @click="toggleTimer">
            {{ formattedTime }}
          </Button>
          <Button variant="ghost" :leftIcon="BugPlay"></Button>
          <Button @click="loadCurrentQuestionIntoEditor">Reset to Starter Code</Button>
          <Button variant="outline" :leftIcon="Send" @click="handleSubmit">
            {{ submitButtonLabel }}
          </Button>

        </div>

        <div>
          <Button variant="link">View slides</Button>
        </div>
      </div>

      <!-- Main Sections -->
      <div class="flex flex-1 gap-4 p-4">

        <!-- Section 1: Description / Notes -->
        <div class="w-1/3 max-h-screen overflow-auto rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col">
          <div class="flex items-center gap-4 mb-4">
            <button
                @click="showDescription = true; showNotes = false"
                :class="['flex items-center gap-2 px-2 py-1 rounded-md font-semibold',
                 showDescription ? 'bg-neutral-200 dark:bg-neutral-800' : '',
                 'text-neutral-800 dark:text-neutral-100']"
            >
              <BookOpenText class="w-5 h-5 text-pink-600" />
              Description
            </button>

            <button
                @click="showDescription = false; showNotes = true"
                :class="['flex items-center gap-2 px-2 py-1 rounded-md font-semibold',
                 showNotes ? 'bg-neutral-200 dark:bg-neutral-800' : '',
                 'text-neutral-800 dark:text-neutral-100']"
            >
              <NotebookPen class="w-5 h-5 text-pink-600" />
              Notes
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-auto p-2">
            <div v-if="currentQuestion" class="space-y-4">
              <!-- Description Tab -->
              <div v-if="showDescription">
                <!-- Question Header -->
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold text-purple-400">
                    Question {{ currentQuestionIndex + 1 }}:
                  </h3>
                  <span class="text-sm font-medium text-gray-500">
                    Tier: {{ currentQuestion.tier }}
                  </span>
                </div>

                <!-- Problem Statement -->
                <div class="border-gray-200 dark:border-neutral-700 rounded-md p-4 shadow-sm">
                  <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {{ currentQuestion.prompt }}
                  </p>
                </div>

                <!-- Input / Output Examples -->
                <div v-if="currentQuestion.examples?.length" class="space-y-2">
                  <h4 class="font-semibold text-gray-700 dark:text-gray-300">Examples:</h4>
                  <div v-for="(ex, idx) in currentQuestion.examples" :key="idx" class="bg-gray-100 dark:bg-neutral-700 rounded-md p-3 border border-gray-200 dark:border-neutral-600">
                    <p><span class="font-semibold">Input:</span></p>
                    <pre class="bg-gray-200 dark:bg-neutral-600 p-2 rounded text-sm overflow-x-auto">{{ ex.input }}</pre>
                    <p class="mt-1"><span class="font-semibold">Output:</span></p>
                    <pre class="bg-gray-200 dark:bg-neutral-600 p-2 rounded text-sm overflow-x-auto">{{ ex.output }}</pre>
                  </div>
                </div>

                <!-- Constraints -->
                <div v-if="currentQuestion.constraints?.length" class="mt-2">
                  <h4 class="font-semibold text-gray-700 dark:text-gray-300">Constraints:</h4>
                  <ul class="list-disc list-inside text-gray-800 dark:text-gray-200">
                    <li v-for="(c, i) in currentQuestion.constraints" :key="i">{{ c }}</li>
                  </ul>
                </div>
              </div>

              <div v-else-if="showNotes" class="flex flex-col h-full">
                <textarea
                    v-model="questionNotes[currentQuestionIndex]"
                    class="flex-1 w-full rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Write your notes here..."
                ></textarea>
              </div>
            </div>

            <div v-else class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No question loaded
            </div>
          </div>
        </div>

        <!-- Section 2 & 3: Right Column with resizable divider -->
        <div class="w-2/3 flex flex-col gap-0 rounded-lg bg-neutral-100 dark:bg-neutral-900 overflow-hidden">

          <!-- Section 2: Code Editor -->
          <div :style="{ height: section2Height + '%' }" class="p-1 flex flex-col">
            <div class="flex items-center justify-between mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              <div class="flex items-center gap-2">
                <CodeXml class="w-5 h-5 text-pink-600" />
                <span>Code</span>
              </div>
              <span class="px-3 py-1 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm font-medium">
                Python
              </span>
            </div>
            <div ref="editorContainer" class="flex-1 overflow-hidden rounded-md"></div>
          </div>

          <!-- Divider -->
          <div
              class="h-1 cursor-row-resize bg-neutral-300 dark:bg-neutral-500"
              @mousedown.prevent="onMouseDown"
          ></div>

          <!-- Section 3: Testcases / Output -->
          <div :style="{ height: section3Height + '%' }" class="p-1 flex flex-col">
            <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              <CircleCheck class="w-5 h-5 text-pink-600" />
              <span>Testcases</span>
            </div>
            <div class="flex-1 overflow-auto">
              <!-- Testcase/output -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional: smoother cursor while resizing */
</style>
