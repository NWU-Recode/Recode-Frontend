<script setup lang="ts">
import { useRouter, useRuntimeConfig } from '#app'
import { Loader2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { cn } from '@/lib/utils'
import PasswordInput from '~/components/PasswordInput.vue'
import { useAuth } from '~/composables/useAuth'

// Form state
const full_name = ref('')
const email = ref('')
const student_number = ref('')
const password = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuth()

async function onSubmit(event: Event) {
  event.preventDefault()
  errors.value = {}

  if (!full_name.value || !email.value || !password.value || !confirmPassword.value || !student_number.value) {
    errors.value.general = 'All fields are required'
    return
  }

  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    // Register user
    await $fetch(`/api/auth/register`, {
      method: 'POST',
      body: { full_name: full_name.value, email: email.value, student_number: student_number.value, password: password.value },
      credentials: 'include',
    })

    // Automatically log in
    await $fetch(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { email: email.value, password: password.value },
      credentials: 'include',
    })

    // Fetch user profile into auth store
    await auth.fetchUser()

    // Redirect to dashboard
    router.push('/')
  }
  catch (err: any) {
    console.error('Registration error:', err)
    if (err?.data?.detail) {
      errors.value.general = err.data.detail
    }
    else {
      errors.value.general = 'An unexpected error occurred'
    }
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit="onSubmit">
      <div class="grid gap-4">
        <!-- Name -->
        <div class="grid gap-2">
          <Label for="full_name">Name</Label>
          <Input
            id="full_name"
            v-model="full_name"
            placeholder="Enter your name"
            type="text"
            auto-capitalize="none"
            auto-complete="name"
            auto-correct="off"
            :disabled="isLoading"
          />
        </div>

        <!-- Email -->
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            placeholder="name@example.com"
            type="email"
            auto-capitalize="none"
            auto-complete="email"
            auto-correct="off"
            :disabled="isLoading"
          />
        </div>

        <!-- Student number -->
        <div class="grid gap-2">
          <Label for="password">Student number</Label>
          <Input
            id="student_number"
            v-model="student_number"
            placeholder="Enter your student number"
            type="number"
            auto-capitalize="none"
            auto-complete="off"
            :disabled="isLoading"
          />
        </div>

        <!-- Password -->
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <PasswordInput id="password" v-model="password" />
        </div>

        <!-- Confirm Password -->
        <div class="grid gap-2">
          <Label for="confirm-password">Confirm Password</Label>
          <PasswordInput id="confirm-password" v-model="confirmPassword" />
          <p v-if="errors.confirmPassword" class="text-sm text-red-500">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- Submit Button -->
        <Button :disabled="isLoading" class="flex items-center gap-2">
          <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
          Sign Up with Email
        </Button>

        <p v-if="errors.general" class="mt-2 text-sm text-red-500">
          {{ errors.general }}
        </p>
      </div>
    </form>
  </div>
</template>
