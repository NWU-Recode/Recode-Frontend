<script setup lang="ts">
import type { PrimitiveProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { Primitive } from 'radix-vue'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  leftIcon?: any
  rightIcon?: any
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})
</script>

<template>
  <Primitive
      :as="as"
      :as-child="asChild"
      :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <span class="flex items-center gap-2">
      <component v-if="leftIcon" :is="leftIcon" class="w-4 h-4" />

      <slot />

      <component v-if="rightIcon" :is="rightIcon" class="w-4 h-4" />
    </span>
  </Primitive>
</template>
