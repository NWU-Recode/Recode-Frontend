<script setup lang="ts">
import ForgotPassword from '@/components/auth/ForgotPassword.vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

const open = ref(false)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogDescription>
          Enter your email below to reset your password.
        </DialogDescription>
      </DialogHeader>

      <ForgotPassword />
    </DialogContent>

    <!-- Trigger -->
    <button
        type="button"
        class="ml-auto inline-block text-sm underline"
        @click="open = true"
    >
      Forgot your password?
    </button>
  </Dialog>
</template>