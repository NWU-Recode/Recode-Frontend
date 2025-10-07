<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
      :class="
      cn(
        'rounded-lg overflow-hidden relative shadow-[0px_0px_10px_1px_rgb(96,165,250)] border bg-card text-card-foreground',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>