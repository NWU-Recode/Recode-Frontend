<script setup lang="ts">
import S_Badges from './components/S_Badges.vue'
import S_Graph from './components/S_Graph.vue'
import S_Title from './components/S_Title.vue'
import Card from '@/components/ui/card/Card.vue'
</script>

<template>
    <div class="flex flex-col gap-4">
    <S_Graph />
    <div class="flex gap-4">
      <Card class="flex-1.5">
        <S_Badges />
      </Card>
      <Card class="flex-1">
        <S_Title />
      </Card>
    </div>
  </div>
</template>

<style scoped>

</style>
