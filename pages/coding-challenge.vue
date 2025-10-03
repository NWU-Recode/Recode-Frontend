<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as monaco from 'monaco-editor'
import { useRouter } from 'vue-router'
import { useApiFetch } from '@/composables/useApiFetch'
import { ChevronLeft, ChevronRight, Timer, BugPlay, Send, BookOpenText, NotebookPen, CodeXml, CircleCheck } from 'lucide-vue-next'

const { apiFetch } = useApiFetch()

// State
const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const loading = ref(true)

// Per-question notes
const questionNotes = ref<string[]>([])
watch(currentQuestionIndex, (idx) => {
  // Ensure notes array has entry for current question
  if (questionNotes.value[idx] === undefined) questionNotes.value[idx] = ''
})


const showDescription = ref(true)
const showNotes = ref(false)

const section2Height = ref(60)
const section3Height = ref(40)

const selectedLanguage = 'python'
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// --- Fetch questions from backend ---
async function fetchQuestions() {
  try {
    const challengeId = localStorage.getItem('currentChallengeId')
    if (!challengeId) return

    // Use composable if you have one, or full API URL
    const data = await apiFetch(`/challenges/${challengeId}/questions`)
    questions.value = data.items || []

    if (questions.value.length > 0 && editor) {
      editor.setValue(questions.value[0].starter_code || '')
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
function loadCurrentQuestionIntoEditor() {
  if (!editor || !currentQuestion.value) return
  editor.setValue(currentQuestion.value.starter_code || '')
}

// --- Monaco Init ---
onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: '',
      language: 'python',
      theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light',
      automaticLayout: true,
    })
  }
  fetchQuestions()
})

</script>


<template>
  <div class="flex w-full h-screen">
    <div class="flex-1 flex flex-col">

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
          <Button variant="ghost" :leftIcon="Timer" ></Button>
          <Button variant="ghost" :leftIcon="BugPlay" ></Button>
          <Button variant="outline" :leftIcon="Send" >Submit</Button>
        </div>

        <div>
          <Button variant="link">View slides</Button>
        </div>
      </div>

      <!-- Main Sections -->
      <div class="flex flex-1 gap-4 p-4">

        <!-- Section 1: Description / Notes -->
        <div class="w-1/3 h-full rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col">
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
                  <h3 class="text-lg font-bold text-purple-600">
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

              <!-- Notes Tab -->
              <div v-else-if="showNotes" class="flex flex-col h-full">
                <textarea
                    v-model="questionNotes[currentQuestionIndex]"
                    class="flex-1 w-full rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Write your notes here..."
                ></textarea>
              </div>
            </div>

            <!-- No question loaded -->
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
