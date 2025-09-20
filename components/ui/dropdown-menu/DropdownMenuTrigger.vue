<script setup lang="ts">
import type { DropdownMenuTriggerProps } from 'radix-vue'
import { DropdownMenuTrigger, useForwardProps } from 'radix-vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<DropdownMenuTriggerProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <DropdownMenuTrigger
      class="outline-none flex items-center gap-2"
      v-bind="forwardedProps"
  >
    <slot />
    <ChevronDown class="w-4 h-4 text-neutral-500" />
  </DropdownMenuTrigger>
</template>
