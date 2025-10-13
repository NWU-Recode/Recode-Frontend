<script setup lang="ts">
import { ref } from 'vue'
import { useParallax } from '@vueuse/core'
import Brain3D from "~/components/Brain3D.vue";

defineProps<{
  reverse?: boolean
}>()

// Reference the outer container
const container = ref<HTMLElement | null>(null)
const { tilt, roll } = useParallax(container)
</script>

<template>
  <div
      ref="container"
      class="relative flex flex-col items-center justify-center h-dvh lg:max-w-none lg:flex-row lg:px-0"
      :class="{ 'lg:flex-row-reverse': reverse }"
  >
    <!-- Logo / Image with parallax -->
    <div
        class="relative z-20 flex justify-center items lg:mb-0 lg:ml-6 lg:mr-6 overflow-hidden"
        :style="{
          transform: `translate3d(${tilt * 50}px, ${roll * 50}px, 0)`
        }"
    >
      <Brain3D :tilt="tilt * 0.5" :roll="roll * 0.5" class="h-48 w-48 lg:h-[600px] lg:w-[600px]" />
    </div>

    <!-- Form / Slot -->
    <div class="mx-auto max-w-md w-full flex-1 lg:p-8">
      <slot />
    </div>
  </div>
</template>
