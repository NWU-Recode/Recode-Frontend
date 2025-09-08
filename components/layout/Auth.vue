<script setup lang="ts">
defineProps<{
  reverse?: boolean
}>()
</script>

<template>
  <div
      class="relative flex flex-col lg:flex-row items-center justify-center px-4 h-dvh lg:max-w-none lg:px-0"
      :class="{ 'lg:flex-row-reverse': reverse }"
  >
    <!-- Logo / Image -->
    <div class="relative z-20 lg:mb-0 lg:mr-6 lg:ml-6 flex justify-center">
      <img
          class="w-48 h-48 sm:w-72 sm:h-72 md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px]"
          src="/logo.svg"
          alt="Logo"
      />
    </div>

    <!-- Form / Slot -->
    <div class="mx-auto flex-1 lg:p-8 w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
