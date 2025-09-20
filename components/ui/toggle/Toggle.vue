<script setup lang="ts">
import type { ToggleEmits, ToggleProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { Toggle, useForwardPropsEmits } from 'radix-vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<ToggleProps & {
  class?: HTMLAttributes['class']
}>(), {
  disabled: false,
})

const emits = defineEmits<ToggleEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <Toggle
      v-bind="forwarded"
      :class="cn(
      // Track
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      'data-[state=off]:bg-neutral-200 dark:data-[state=off]:bg-neutral-700',
      'data-[state=on]:bg-purple-400',
      'group',
      props.class
    )"
  >
    <!-- Circle (thumb) -->
    <span
        :class="cn(
      'inline-block h-5 w-5 transform rounded-full bg-neutral-700 dark:bg-neutral-100 transition-transform',
      'group-data-[state=off]:translate-x-1',
      'group-data-[state=on]:translate-x-5'
    )"
    />
  </Toggle>
</template>
