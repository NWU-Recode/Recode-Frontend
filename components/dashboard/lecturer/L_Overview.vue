<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import * as monaco from 'monaco-editor'
import { ChevronLeft, ChevronRight, Send, BookOpenText, CodeXml, CircleCheck } from 'lucide-vue-next'
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


const { apiFetch } = useApiFetch()

// --- User info ---
const lecturer = ref<{ full_name: string }>({ full_name: '' })

// --- Modules & Challenges ---
const modules = ref<any[]>([])
const cards = ref<any[]>([]) // challenge progress cards
const challengeOptions = ref<any[]>([]) // dropdown challenges
const selectedChallengeId = ref<string | null>(null)

// --- Monaco Editor ---
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor
const selectedLanguage = ref('python')

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
    modules.value = res
  } catch (err) {
    console.error('Failed to fetch modules:', err)
  }
}

// --- Fetch challenge progress (cards) & dropdown options ---
async function fetchCards() {
  try {
    const res = await apiFetch('/challenges/progress')
    cards.value = res.map((c: any) => {
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

    // Populate dropdown options from cards
    challengeOptions.value = cards.value.map(c => ({
      id: c.id,
      title: c.topic,
      module_code: c.module_code,
    }))
  } catch (err) {
    console.error('Failed to fetch challenge progress:', err)
  }
}

// --- Monaco editor init ---
onMounted(() => {
  fetchLecturer()
  fetchModules()
  fetchCards()

  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: `def hello():\n    print("Hello, world!")\n\nhello()`,
      language: selectedLanguage.value,
      theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light',
      automaticLayout: true,
    })
  }
})
</script>

<template>
  <div class="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full">
    <!-- Header -->
    <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400">
      Welcome, {{ lecturer.full_name }}
    </h2>

    <!-- Challenge Progress Cards -->
    <div
        class="grid gap-4 sm:gap-6"
        style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))"
    >
      <Card v-for="card in cards" :key="card.id" class="h-48 sm:h-52 md:h-56 lg:h-60">
        <CardContent class="h-full flex flex-col justify-center p-4">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between mr-2">
            <div class="flex flex-col">
              <span class="text-sm">{{ card.module_code }}</span>
              <span v-if="card.week_number != null" class="text-xs text-gray-500">
                Week: {{ card.week_number }}
              </span>
            </div>
            <span class="text-sm sm:text-base font-semibold text-center mt-2 sm:mt-0">
              {{ card.topic }}
            </span>
          </div>

          <!-- Icons row -->
          <div
              class="mt-2 flex flex-wrap gap-4"
              :class="card.icons.length === 1 ? 'justify-center' : 'justify-between'"
          >
            <div v-for="(icon, i) in card.icons" :key="i" class="flex flex-col items-center gap-1">
              <img :src="icon" class="h-10 w-10" />
              <span class="text-sm font-semibold">{{ card.percentages[i] }}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Dropdown & Navigation -->
    <div class="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger
            class="w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm flex items-center justify-between text-sm sm:text-base whitespace-normal break-words"
        >
          {{ selectedChallengeId ? challengeOptions.find(c => c.id === selectedChallengeId)?.title : 'Select challenge' }}
        </DropdownMenuTrigger>

        <DropdownMenuContent class="max-w-xs w-full break-words">
          <DropdownMenuItem
              v-for="challenge in challengeOptions"
              :key="challenge.id"
              @click="selectedChallengeId = challenge.id"
              class="whitespace-normal"
          >
            <div class="flex flex-col">
              <span class="font-semibold">{{ challenge.title }}</span>
              <span class="text-xs text-gray-500">{{ challenge.module_code }}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div class="flex flex-wrap sm:flex-nowrap justify-end gap-2 items-center">
        <Button variant="outline" :leftIcon="ChevronLeft">Previous</Button>
        <span class="p-2">Question 1</span>
        <Button variant="outline" :rightIcon="ChevronRight">Next</Button>
        <Button variant="outline" :leftIcon="Send">Submit</Button>
      </div>
    </div>

    <!-- Description / Code / Testcases -->
    <div
        class="grid gap-4 sm:gap-6"
        style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))"
    >
      <!-- Description -->
      <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow min-h-[200px]">
        <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          <BookOpenText class="w-5 h-5 text-pink-600" />
          <span>Description</span>
        </div>
        <div class="flex-1 overflow-auto">
          <p>Question details will go here</p>
        </div>
      </div>

      <!-- Code editor -->
      <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow min-h-[200px]">
        <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          <CodeXml class="w-5 h-5 text-pink-600" />
          <span>Code</span>
        </div>
        <div ref="editorContainer" class="flex-1 overflow-auto rounded-md"></div>
      </div>

      <!-- Testcases -->
      <div class="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col shadow min-h-[200px]">
        <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          <CircleCheck class="w-5 h-5 text-pink-600" />
          <span>Testcases</span>
        </div>
        <div class="flex-1 overflow-auto">
          <p class="text-neutral-700 dark:text-neutral-200">Testcase results will appear here</p>
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


