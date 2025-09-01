<script setup lang="ts">
defineProps<{
  reverse?: boolean
}>()
</script>

<template>
  <div
    class="relative flex items-center justify-center px-4 h-dvh lg:max-w-none lg:px-0"
    :class="{ 'flex-row-reverse': reverse }"
  >
      <div class="relative z-20">
        <img class="w-[600px] h-[600px]" src="/logo.svg" alt="" />
      </div>
    <div class="mx-auto flex-1 lg:p-8">
      <slot />
    </div>
  </div>
</template>

<style scoped>

</style>
