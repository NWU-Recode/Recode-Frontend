<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { ChevronLeft, ChevronRight, Timer, BugPlay, Send, BookOpenText, NotebookPen, CodeXml, CircleCheck } from 'lucide-vue-next'

const title = 'Coding Challenge'
const colorMode = useColorMode()

// Example question state
const currentQuestion = 0
const totalQuestions = 5

// Toggles for description/notes
const showDescription = ref(true)
const showNotes = ref(false)

// Section 2 & 3 heights
const section2Height = ref(60) // in percent
const section3Height = ref(40) // in percent

// Resizer variables
let startY = 0
let startSection2 = 0

function onMouseDown(e: MouseEvent) {
  startY = e.clientY
  startSection2 = section2Height.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  const delta = e.clientY - startY
  const container = e.currentTarget?.parentElement
  const containerHeight = container?.offsetHeight || 500
  const deltaPercent = (delta / containerHeight) * 100
  let newHeight = startSection2 + deltaPercent
  newHeight = Math.min(Math.max(newHeight, 10), 90)
  section2Height.value = newHeight
  section3Height.value = 100 - newHeight
}

function onMouseUp() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

// Monaco Editor
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor
const selectedLanguage = ref('python') // default

onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: `def hello():\n    print("Hello, world!")\n\nhello()`,
      language: selectedLanguage.value,
      theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light',
      automaticLayout: true,
    })
  }
})

// Watch theme changes
watch(
    () => colorMode.preference,
    (preference) => {
      if (!editor) return
      let theme = 'vs-light'
      if (preference === 'dark') theme = 'vs-dark'
      else if (preference === 'light') theme = 'vs-light'
      else if (preference === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs-light'
      }
      monaco.editor.setTheme(theme)
    },
    { immediate: true }
)

// Watch language changes
watch(selectedLanguage, (lang) => {
  if (!editor) return
  const value = editor.getValue()
  const model = monaco.editor.createModel(value, lang)
  editor.setModel(model)
})
</script>

<template>
  <div class="flex w-full h-screen">
    <div class="flex-1 flex flex-col">

      <!-- Top Buttons -->
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-2">
          <span>Question 1</span>
          <Button variant="outline" :leftIcon="ChevronLeft" :disabled="currentQuestion === 0">Previous</Button>
          <Button variant="outline" :rightIcon="ChevronRight" :disabled="currentQuestion === totalQuestions - 1">Next</Button>
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

          <div class="flex-1 overflow-auto">
            <div v-if="showDescription">
              <p>Question details will go here</p>
            </div>
            <div v-else-if="showNotes">
              <p>You can make additional notes here</p>
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
              <select
                  v-model="selectedLanguage"
                  class="border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-sm bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100"
              >
                <option value="python">Python</option>
                <option value="javascript" disabled>JavaScript</option>
                <option value="cpp" disabled>C++</option>
                <option value="java" disabled>Java</option>
              </select>
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
