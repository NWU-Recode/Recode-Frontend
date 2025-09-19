<script setup lang="ts">
import Card from '@/components/ui/card/Card.vue'
</script>

<!-- I commented where the icons need to be added still. -->

<template>
    <Card>
    <div class="flex justify-between p-4">
      <!-- Bronze Badge -->
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <!-- This is just a placeholder for Bronze Icon -->
          Bronze
        </div>
        <span class="mt-2 font-semibold">3</span>
      </div>

      <!-- Silver Badge -->
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <!-- This is just a placeholder for Silver Icon -->
          Silver
        </div>
        <span class="mt-2 font-semibold">1</span>
      </div>

      <!-- Gold Badge -->
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <!-- This is just a placeholder for Gold Icon -->
          Gold
        </div>
        <span class="mt-2 font-semibold">6</span>
      </div>

      <!-- Ruby Badge -->
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <!-- This is just a placeholder for Ruby Icon -->
          Ruby
        </div>
        <span class="mt-2 font-semibold">2</span>
      </div>
    </div>
  </Card>
</template>

<style scoped>

</style>
