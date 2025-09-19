<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <thead :class="cn('[&_tr]:border-b bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 text-white', props.class)">
  <slot />
  </thead>
</template>
