<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRuntimeConfig } from '#app'
import PasswordInput from '~/components/PasswordInput.vue'
import { Loader2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { Icon } from '@iconify/vue'
import ForgotPasswordModal from "~/components/auth/ForgotPasswordModal.vue";

// Form state
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errors = ref<string | null>(null)

const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuth()

async function onSubmit(event: Event) {
  event.preventDefault()
  errors.value = null

  if (!email.value || !password.value) {
    errors.value = 'Please enter your email and password.'
    return
  }

  isLoading.value = true

  try {
    // Call login endpoint
    const response = await $fetch<{ access_token: string; refresh_token: string }>(
        `${config.public.apiBase}/auth/login`,
        {
          method: 'POST',
          body: { email: email.value, password: password.value },
        }
    )

    // Store tokens for API requests
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token) // optional

    // Fetch user profile into auth store
    const user = await auth.fetchUser()

    // Redirect based on role
    if (user?.role === 'admin') router.push('/admin')
    else router.push('/')
  } catch (err: any) {
    console.error('Login error:', err)
    errors.value =
        err?.data?.message ||
        err?.data?.detail ||
        'Login failed. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <div class="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-6">
      <form class="grid gap-6" @submit="onSubmit">
        <!-- Email -->
        <div class="grid gap-2">
          <label for="email">Email</label>
          <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="name@example.com"
              :disabled="isLoading"
              auto-capitalize="none"
              auto-complete="email"
              auto-correct="off"
              required
          />
        </div>

        <!-- Password -->
        <div class="grid gap-2">
          <div class="flex items-center">
            <label for="password">Password</label>
            <ForgotPasswordModal />
          </div>
          <PasswordInput id="password" v-model="password" :disabled="isLoading" />
        </div>

        <!-- Error message -->
        <p v-if="errors" class="text-red-500 text-sm">{{ errors }}</p>

        <!-- Submit -->
        <Button
            type="submit"
            class="w-full flex items-center justify-center gap-2"
            :disabled="isLoading"
        >
          <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
          Login
        </Button>
      </form>

      <!-- Register link -->
      <div class="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account?
        <NuxtLink to="/register" class="underline">Sign up</NuxtLink>
      </div>
    </div>
  </div>
</template>
