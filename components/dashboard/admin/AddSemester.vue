<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'
import { useApiFetch } from '@/composables/useApiFetch'
import { Loader2 } from 'lucide-vue-next'

const { apiFetch } = useApiFetch()
const emit = defineEmits(['close', 'saved'])

const props = defineProps({
  hasCurrent: {
    type: Boolean,
    default: false
  }
})

const form = ref({
  year: new Date().getFullYear(),
  term_name: '',
  start_date: '',
  end_date: '',
  is_current: false,
})

const isLoading = ref(false)
const errorMessage = ref(null)

async function onSubmit() {
  isLoading.value = true
  errorMessage.value = null
  try {
    await apiFetch('/admin/semesters', {
      method: 'POST',
      body: {
        year: form.value.year,
        term_name: form.value.term_name,
        start_date: form.value.start_date,
        end_date: form.value.end_date,
      },
    })
    emit('saved')
    emit('close')
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Failed to create semester. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-neutral-200 dark:bg-neutral-900 rounded-lg p-6 w-full max-w-lg shadow-lg">
      <h2 class="text-lg font-semibold mb-4">Add Semester</h2>

      <form @submit.prevent="onSubmit" class="grid gap-4">
        <!-- Year -->
        <div class="grid gap-2">
          <Label for="year">Year</Label>
          <Input id="year" v-model="form.year" type="number" :disabled="isLoading" />
        </div>

        <!-- Term Name -->
        <div class="grid gap-2">
          <Label for="term_name">Term Name</Label>
          <Input id="term_name" v-model="form.term_name" type="text" :disabled="isLoading" />
        </div>

        <!-- Start Date -->
        <div class="grid gap-2">
          <Label for="start_date">Start Date</Label>
          <Input id="start_date" v-model="form.start_date" type="date" :disabled="isLoading" />
        </div>

        <!-- End Date -->
        <div class="grid gap-2">
          <Label for="end_date">End Date</Label>
          <Input id="end_date" v-model="form.end_date" type="date" :disabled="isLoading" />
        </div>

        <!-- Current Semester Toggle -->
        <div class="flex items-center gap-2 mt-2">
          <Toggle
              v-model:pressed="form.is_current"
              :disabled="isLoading || props.hasCurrent"
          />
          <Label for="is_current">Set as Current Semester</Label>
          <p v-if="props.hasCurrent" class="text-xs text-neutral-500">
            A current semester already exists.
          </p>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-2 mt-4">
          <Button variant="secondary" @click="$emit('close')" :disabled="isLoading">Cancel</Button>
          <Button :disabled="isLoading" class="flex items-center gap-2">
            <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
            Save Semester
          </Button>
        </div>

        <!-- Error -->
        <p v-if="errorMessage" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>
