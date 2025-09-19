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
      'border-b transition-colors duration-200 data-[state=selected]:bg-muted',
      'hover:bg-[linear-gradient(to_top_right,rgba(96,165,250,0.4),rgba(139,92,246,0.4),rgba(236,72,153,0.4))]',
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
