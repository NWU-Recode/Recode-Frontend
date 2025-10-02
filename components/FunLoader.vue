<script setup>
import { ref, onMounted, computed } from 'vue'
import aiRobotBrain from '~/assets/lottie/ai-robot-brain.json'
import aiBrainBoard from '~/assets/lottie/ai-brain-board.json'
import designersBrain from '~/assets/lottie/designers-brain.json'
import coding1 from '~/assets/lottie/coding-1.json'
import coding2 from '~/assets/lottie/coding-2.json'
import developer from '~/assets/lottie/developer.json'
import { Vue3Lottie } from 'vue3-lottie'

const animations = [aiRobotBrain, aiBrainBoard, designersBrain, coding1, coding2, developer]
const selectedAnimation = ref(animations[Math.floor(Math.random() * animations.length)])

const PRIMARY_COLOR = '#1E40AF'
onMounted(() => {
  const paths = document.querySelectorAll('.loader-container path')
  paths.forEach((p) => {
    if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') {
      p.setAttribute('fill', PRIMARY_COLOR)
    }
  })
})

// --- Responsive size ---
const animationSize = ref({ width: 450, height: 450 })

function updateSize() {
  const width = window.innerWidth
  if (width < 640) {          // small screens
    animationSize.value = { width: 250, height: 250 }
  } else if (width < 1024) {  // medium screens
    animationSize.value = { width: 350, height: 350 }
  } else {                     // large screens
    animationSize.value = { width: 450, height: 450 }
  }
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
})

</script>

<template>
  <client-only>
    <div class="loader-container fade">
      <Vue3Lottie
          :animationData="selectedAnimation"
          :height="animationSize.height"
          :width="animationSize.width"
          :loop="true"
          :autoPlay="true"
      />
    </div>
  </client-only>
</template>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* stick to top */
  padding-top: 80px;           /* adjust as needed */
  height: 100vh;
  transition: opacity 0.6s ease;
  opacity: 1;
}

.loader-container.fade-leave-active {
  opacity: 0;
}
</style>
