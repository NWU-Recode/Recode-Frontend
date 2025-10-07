<script setup lang="ts">
defineProps<{
  reverse?: boolean
}>()
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center px-4 h-dvh lg:max-w-none lg:flex-row lg:px-0"
    :class="{ 'lg:flex-row-reverse': reverse }"
  >
    <Transition name="slide">
      <div class="relative z-20 flex justify-center lg:mb-0 lg:ml-6 lg:mr-6">
        <img
          class="h-48 w-48 lg:h-[600px] lg:w-[600px] md:h-[400px] md:w-[400px] sm:h-72 sm:w-72"
          src="/logo.svg"
          alt="Logo"
        >
      </div>
    </Transition>

    <div class="mx-auto max-w-md w-full flex-1 lg:p-8">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-enter-active {
  transition: all 0.7s ease-out;
}

.slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}
</style>
