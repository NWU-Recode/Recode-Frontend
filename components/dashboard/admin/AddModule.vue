<script setup>
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useApiFetch } from '@/composables/useApiFetch'
import { Loader2 } from 'lucide-vue-next'

const { apiFetch } = useApiFetch()
const emit = defineEmits(['close', 'saved'])

// Props
const props = defineProps({
  module: Object,       // existing module to edit, optional
  semesterId: String,   // semester_id to assign module to
})

// Form state
const form = ref({
  code: '',
  name: '',
  description: '',
  semester_id: props.semesterId || '',
  lecturer_id: '',
  code_language: '',
  credits: '',
})

const isLoading = ref(false)
const errorMessage = ref(null)

// Pre-fill form if editing
watch(
    () => props.module,
    (mod) => {
      if (mod) {
        form.value = {
          code: mod.code,
          name: mod.name,
          description: mod.description,
          semester_id: props.semesterId,
          lecturer_id: mod.lecturer_id,
          code_language: mod.code_language,
          credits: mod.credits,
        }
      } else {
        // Reset form for new module
        form.value = {
          code: '',
          name: '',
          description: '',
          semester_id: props.semesterId,
          lecturer_id: '',
          code_language: '',
          credits: '',
        }
      }
    },
    { immediate: true }
)

// Submit handler
async function onSubmit() {
  // Simple front-end validation
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
      // Edit existing module
      await apiFetch(`/admin/${props.module.code}`, {
        method: 'PUT',
        body: {
          code: form.value.code,
          name: form.value.name,
          description: form.value.description,
          semester_id: form.value.semester_id,
          lecturer_id: Number(form.value.lecturer_id),
          code_language: form.value.code_language,
          credits: Number(form.value.credits),
        },
      })
    } else {
      // Add new module
      await apiFetch('/admin/', {
        method: 'POST',
        body: {
          code: form.value.code,
          name: form.value.name,
          description: form.value.description,
          semester_id: form.value.semester_id,
          lecturer_id: Number(form.value.lecturer_id),
          code_language: form.value.code_language,
          credits: Number(form.value.credits),
        },
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
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-neutral-200 dark:bg-neutral-900 rounded-lg p-6 w-full max-w-lg shadow-lg">
      <h2 class="text-lg font-semibold mb-4">
        {{ props.module ? 'Edit Module' : 'Add Module' }}
      </h2>

      <form @submit.prevent="onSubmit" class="grid gap-4">
        <!-- Code -->
        <div class="grid gap-2">
          <Label for="code">Code</Label>
          <Input id="code" v-model="form.code" type="text" :disabled="isLoading" required />
        </div>

        <!-- Name -->
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" type="text" :disabled="isLoading" required />
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" :disabled="isLoading" required />
        </div>

        <!-- Lecturer ID -->
        <div class="grid gap-2">
          <Label for="lecturer_id">Lecturer ID</Label>
          <Input id="lecturer_id" v-model="form.lecturer_id" type="number" :disabled="isLoading" required />
        </div>

        <!-- Code Language Dropdown -->
        <div class="grid gap-2">
          <Label for="code_language">Code Language</Label>
          <select
              id="code_language"
              v-model="form.code_language"
              :disabled="isLoading"
              required
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>Select language</option>
            <option value="python">Python</option>
            <option value="javascript" disabled>JavaScript</option>
            <option value="cpp" disabled>C++</option>
            <option value="java" disabled>Java</option>
          </select>
        </div>

        <!-- Credits -->
        <div class="grid gap-2">
          <Label for="credits">Credits</Label>
          <Input id="credits" v-model="form.credits" type="number" :disabled="isLoading" required />
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-2 mt-4">
          <Button variant="secondary" @click="$emit('close')" :disabled="isLoading">Cancel</Button>
          <Button :disabled="isLoading" class="flex items-center gap-2">
            <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
            {{ props.module ? 'Save Changes' : 'Add Module' }}
          </Button>
        </div>

        <!-- Error -->
        <p v-if="errorMessage" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>
