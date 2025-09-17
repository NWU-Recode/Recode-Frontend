<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tr
      :class="cn(
      'border-b transition-colors duration-200 data-[state=selected]:bg-muted',
      // Hover: muted gradient version of header
      'hover:bg-[linear-gradient(to_top_right,rgba(96,165,250,0.4),rgba(139,92,246,0.4),rgba(236,72,153,0.4))]',
      props.class
    )"
  >
    <slot />
  </tr>
</template>
