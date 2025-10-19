<script setup lang="ts">
import { ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  class?: HTMLAttributes['class']
  collapsible?: boolean
}>()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <!-- Main row -->
  <tr
      :class="cn(
    'border-b transition-all duration-200 relative',
    'hover:bg-white/30 dark:hover:bg-white/5 hover:backdrop-blur-sm',
    'hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]',
    props.class
  )"
  >
    <td
        v-if="props.collapsible"
        class="w-6 text-center cursor-pointer px-3 py-2"
        @click="toggle"
    >
      <component :is="isOpen ? ChevronDown : ChevronRight" class="w-4 h-4 inline-block" />
    </td>
    <slot />
  </tr>

  <!-- Expanded rows -->
  <template v-if="props.collapsible && isOpen">
    <slot name="expanded" />
  </template>
</template>
