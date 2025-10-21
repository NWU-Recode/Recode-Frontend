<script setup>
import { ref, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu' // adjust path if needed
import { useApiFetch } from '@/composables/useApiFetch'

const { apiFetch } = useApiFetch()
const emit = defineEmits(['close', 'saved'])

const props = defineProps({
  module: Object,
  semesterId: String,
  semesters: {
    type: Array,
    default: () => [],
  },
})

const form = ref({
  code: '',
  name: '',
  description: '',
  semester_id: props.semesterId || '',
  lecturer_id: '',
  code_language: 'python',
  credits: '',
})

const selectedSemesterId = ref(form.value.semester_id)
const isLoading = ref(false)
const errorMessage = ref(null)

// Watch for module edit
watch(
    () => props.module,
    (mod) => {
      if (mod) {
        form.value = {
          code: mod.code,
          name: mod.name,
          description: mod.description,
          semester_id: mod.semester_id || props.semesterId || '',
          lecturer_id: mod.lecturer_id,
          code_language: mod.code_language || 'python',
          credits: mod.credits,
        }
        selectedSemesterId.value = form.value.semester_id
      } else {
        form.value.semester_id = props.semesterId || ''
        selectedSemesterId.value = form.value.semester_id
      }
    },
    { immediate: true }
)

watch(selectedSemesterId, (val) => {
  form.value.semester_id = val
})

// Submit handler
async function onSubmit() {
  for (const [key, value] of Object.entries(form.value)) {
    if (!value) {
      errorMessage.value = `Field "${key}" is required`
      return
    }
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    if (props.module) {
      await apiFetch(`/admin/${props.module.code}`, {
        method: 'PUT',
        body: { ...form.value, lecturer_id: Number(form.value.lecturer_id), credits: Number(form.value.credits) },
      })
    } else {
      await apiFetch('/admin/', {
        method: 'POST',
        body: { ...form.value, lecturer_id: Number(form.value.lecturer_id), credits: Number(form.value.credits) },
      })
    }

    emit('saved')
    emit('close')
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Failed to save module. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function getSemesterStatus(sem) {
  switch (sem.computed_status) {
    case 'current': return 'Current'
    case 'completed': return 'Completed'
    default: return 'Upcoming'
  }
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-neutral-200 dark:bg-neutral-900 rounded-lg p-6 w-full max-w-lg shadow-lg">
      <h2 class="text-lg font-semibold mb-4">
        {{ props.module ? 'Edit Module' : 'Add Module' }}
      </h2>

      <form @submit.prevent="onSubmit" class="grid gap-4">
        <!-- Semester Dropdown -->
        <div class="grid gap-2">
          <Label for="semester_id">Semester</Label>
          <DropdownMenu>
            <DropdownMenuTrigger
                class="w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm flex items-center justify-between text-sm sm:text-base whitespace-normal break-words"
            >
              {{ selectedSemesterId ? props.semesters.find(s => s.id === selectedSemesterId)?.term_name : 'Select semester' }}
            </DropdownMenuTrigger>

            <DropdownMenuContent class="max-w-xs w-full break-words max-h-64 overflow-y-auto">
              <DropdownMenuItem
                  v-for="sem in props.semesters"
                  :key="sem.id"
                  @click="selectedSemesterId = sem.id"
                  class="whitespace-normal"
              >
                <div class="flex flex-col">
                  <span class="font-semibold">{{ sem.term_name }} ({{ sem.year }})</span>
                  <span class="text-xs text-neutral-500">
                    {{ sem.start_date }} → {{ sem.end_date }} — {{ getSemesterStatus(sem) }}
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Other fields same as before -->
        <div class="grid gap-2">
          <Label for="code">Code</Label>
          <Input id="code" v-model="form.code" type="text" :disabled="isLoading" required />
        </div>

        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" type="text" :disabled="isLoading" required />
        </div>

        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" :disabled="isLoading" required />
        </div>

        <div class="grid gap-2">
          <Label for="lecturer_id">Lecturer ID</Label>
          <Input id="lecturer_id" v-model="form.lecturer_id" type="number" :disabled="isLoading" required />
        </div>

        <div class="grid gap-2">
          <Label for="code_language">Code Language</Label>
          <DropdownMenu>
            <DropdownMenuTrigger
                class="w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm flex items-center justify-between text-sm sm:text-base whitespace-normal break-words"
            >
              {{ form.code_language.charAt(0).toUpperCase() + form.code_language.slice(1) }}
            </DropdownMenuTrigger>
            <DropdownMenuContent class="max-w-xs w-full break-words max-h-64 overflow-y-auto">
              <DropdownMenuItem @click="form.code_language = 'python'">Python</DropdownMenuItem>
              <DropdownMenuItem @click="form.code_language = 'javascript'">JavaScript</DropdownMenuItem>
              <DropdownMenuItem @click="form.code_language = 'cpp'">C++</DropdownMenuItem>
              <DropdownMenuItem @click="form.code_language = 'java'">Java</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div class="grid gap-2">
          <Label for="credits">Credits</Label>
          <Input id="credits" v-model="form.credits" type="number" :disabled="isLoading" required />
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button variant="secondary" @click="$emit('close')" :disabled="isLoading">Cancel</Button>
          <Button :disabled="isLoading" class="flex items-center gap-2">
            <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
            {{ props.module ? 'Save Changes' : 'Add Module' }}
          </Button>
        </div>

        <p v-if="errorMessage" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>