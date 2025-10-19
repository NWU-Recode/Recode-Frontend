<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <!-- Outer wrapper: gradient border -->
  <div
      class="relative w-full overflow-x-auto rounded-lg p-[2px]
      bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400
      dark:from-blue-600 dark:via-purple-600 dark:to-pink-600"
  >
    <!-- Inner wrapper: actual table background -->
    <div class="rounded-lg bg-card">
      <table :class="cn('min-w-full table-fixed caption-bottom text-sm', props.class)">
        <slot />
      </table>
    </div>
  </div>
</template>
