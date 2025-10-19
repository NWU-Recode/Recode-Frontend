<script setup lang="ts">
import { ref } from 'vue'
import { useParallax } from '@vueuse/core'
import Brain3D from "~/components/Brain3D.vue";

defineProps<{
  reverse?: boolean
}>()

const container = ref<HTMLElement | null>(null)
const { tilt, roll } = useParallax(container)
</script>

<template>
  <div
      ref="container"
      class="relative flex flex-col items-center justify-center min-h-screen lg:flex-row lg:gap-12 lg:px-12 overflow-hidden"
      :class="{ 'lg:flex-row-reverse': reverse }"
  >
    <!-- Logo / 3D Brain -->
    <div
        class="relative flex justify-center items-center w-full lg:w-3/5 mb-4 sm:mb-4 lg:mb-0"
        :style="{ transform: `translate3d(${tilt * 40}px, ${roll * 40}px, 0)` }"
    >
      <Brain3D
          :tilt="tilt * 0.5"
          :roll="roll * 0.5"
          class="w-40 h-40 xs:w-56 xs:h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[700px] lg:h-[700px] transition-all duration-500"
      />
    </div>

    <!-- Slot (Login/Register form) -->
    <div
        class="relative z-20 w-full max-w-md px-6 sm:px-8 lg:px-10 flex flex-col justify-center text-center lg:text-left"
    >
      <slot />
    </div>
  </div>
</template>