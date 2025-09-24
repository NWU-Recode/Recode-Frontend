<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { ChevronLeft, ChevronRight, Send, BookOpenText, CodeXml, CircleCheck } from 'lucide-vue-next'

const topics = [
  'If Statements',
  'Else Statements',
  'While Loops',
  'Do-While Loops',
]
const selectedTopic = ref<string | null>(null)

// Monaco
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor
const selectedLanguage = ref('python')
const colorMode = useColorMode()

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

// theme switching
watch(
    () => colorMode.preference,
    (pref) => {
      if (!editor) return
      let theme = 'vs-light'
      if (pref === 'dark') theme = 'vs-dark'
      else if (pref === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs-light'
      }
      monaco.editor.setTheme(theme)
    },
    { immediate: true }
)

// language switching
watch(selectedLanguage, (lang) => {
  if (!editor) return
  const value = editor.getValue()
  const model = monaco.editor.createModel(value, lang)
  editor.setModel(model)
})
</script>

<template>
  <div>
    <h2 class="mb-4 text-4xl font-bold text-purple-400">
      Welcome, Prof Neels
    </h2>

    <div class="grid mt-10 gap-6 lg:grid-cols-4 md:grid-cols-2 md:gap-8">
      <!-- Card 1 -->
      <Card class="h-40">
        <CardContent class="h-full flex flex-col justify-between p-8">
          <!-- Header -->
          <div class="flex items-start justify-between">
            <span class="text-sm">CMPG 111</span>
            <span class="text-base font-semibold">If Statements</span>
          </div>

          <!-- Icons row (flex, evenly spaced) -->
          <div class="mt-2 flex justify-between">
            <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
            <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
            <img class="h-10 w-10" src="/assets/flat-icons/gold.png" alt="gold">
          </div>

          <!-- Percentages row (flex, evenly spaced) -->
          <div class="mt-4 flex justify-between">
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-semibold">67</span>
              <span class="text-base font-semibold">%</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-semibold">55</span>
              <span class="text-base font-semibold">%</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-semibold">47</span>
              <span class="text-base font-semibold">%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <!-- Card 2 -->
      <Card class="h-40">
        <CardContent class="h-full flex flex-col justify-center p-4">
          <CardContent class="h-full flex flex-col justify-between p-4">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <span class="text-sm">CMPG 111</span>
              <span class="text-base font-semibold">Else Statements</span>
            </div>

            <!-- Icons row (flex, evenly spaced) -->
            <div class="mt-2 flex justify-between">
              <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
              <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
              <img class="h-10 w-10" src="/assets/flat-icons/gold.png" alt="gold">
            </div>

            <!-- Percentages row (flex, evenly spaced) -->
            <div class="mt-4 flex justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-semibold">55</span>
                <span class="text-base font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-semibold">37</span>
                <span class="text-base font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-semibold">12</span>
                <span class="text-base font-semibold">%</span>
              </div>
            </div>
          </CardContent>
        </CardContent>
      </Card>

      <!-- Card 3 -->
      <Card class="h-40">
        <CardContent class="h-full flex flex-col justify-center p-4">
          <CardContent class="h-full flex flex-col justify-between p-4">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <span class="text-sm">CMPG 111</span>
              <span class="text-base font-semibold">While Loops</span>
            </div>

            <!-- Icons row (flex, evenly spaced) -->
            <div class="mt-2 flex justify-between">
              <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
              <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
              <img class="h-10 w-10" src="/assets/flat-icons/gold.png" alt="gold">
            </div>

            <!-- Percentages row (flex, evenly spaced) -->
            <div class="mt-4 flex justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-semibold">55</span>
                <span class="text-base font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-semibold">45</span>
                <span class="text-base font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-semibold">12</span>
                <span class="text-base font-semibold">%</span>
              </div>
            </div>
          </CardContent>
        </CardContent>
      </Card>

      <!-- Card 4 -->
      <Card class="h-40">
        <CardContent class="h-full flex flex-col justify-between p-4">
          <!-- Header -->
          <div class="flex items-start justify-between">
            <span class="text-sm">CMPG 111</span>
            <span class="text-base font-semibold">Do-While Loops</span>
          </div>

          <!-- Icons row (flex, evenly spaced) -->
          <div class="mt-2 flex justify-between">
            <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
            <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
            <img class="h-10 w-10" src="/assets/flat-icons/gold.png" alt="gold">
          </div>

          <!-- Percentages row (flex, evenly spaced) -->
          <div class="mt-4 flex justify-between">
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-semibold">34</span>
              <span class="text-base font-semibold">%</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-semibold">17</span>
              <span class="text-base font-semibold">%</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-semibold">6</span>
              <span class="text-base font-semibold">%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!--
  <Button variant="outline" class="flex items-center gap-2 px-3 py-2">
    <span class="text-sm font-medium">Next Question</span>
  </Button>
  -->
  <div class="mt-8 flex items-center justify-between">
    <DropdownMenu>
      <DropdownMenuTrigger
          class="min-w-[220px] px-4 py-2 border rounded-md shadow-sm cursor-pointer flex items-center justify-between"
      >
        {{ selectedTopic || 'Select a topic to edit your challenges' }}
      </DropdownMenuTrigger>

      <DropdownMenuContent
          class="min-w-[220px] w-full"
      >
        <DropdownMenuItem
            v-for="topic in topics"
            :key="topic"
            @click="selectedTopic = topic"
        >
          {{ topic }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Navigation Buttons: Previous, Next, Submit -->
    <div class="md-4 flex justify-end gap-2">
      <Button variant="outline" :leftIcon="ChevronLeft">Previous</Button>
      <Button variant="outline" :rightIcon="ChevronRight">Next</Button>
      <Button variant="outline" :leftIcon="Send">Submit</Button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-3 md:grid-cols-2 md:gap-8 mt-4">
    <!-- Section 1: Description -->
    <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow">
      <div class="flex items-center gap-2 mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        <BookOpenText class="w-5 h-5 text-pink-600" />
        <span>Description</span>
      </div>
      <div class="flex-1 overflow-auto">
        <p>Question details will go here</p>
      </div>
    </div>

    <!-- Section 2: Code with Monaco -->
    <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow h-100">
      <div class="flex items-center justify-between mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        <div class="flex items-center gap-2">
          <CodeXml class="w-5 h-5 text-pink-600" />
          <span>Code</span>
        </div>
      </div>
      <div ref="editorContainer" class="flex-1 overflow-hidden rounded-md"></div>
    </div>

    <!-- Section 3: Testcases -->
    <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow">
      <div class="flex items-center gap-2 mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        <CircleCheck class="w-5 h-5 text-pink-600" />
        <span>Testcases</span>
      </div>
      <div class="flex-1 overflow-auto">
        <p class="text-neutral-700 dark:text-neutral-200">Testcase results will appear here</p>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
