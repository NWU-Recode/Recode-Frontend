<script setup>
import { ref, onMounted } from 'vue'
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
</script>

<template>
  <client-only>
    <div class="loader-container fade">
      <Vue3Lottie
          :animationData="selectedAnimation"
          :height="450"
          :width="450"
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
p {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: var(--text-color, #555);
}
</style>
