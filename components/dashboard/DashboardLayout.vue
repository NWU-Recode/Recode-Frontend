<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import NavTabs from '~/components/ui/tabs/NavTabs.vue'

const { user } = useAuth()

const activeTab = ref('overview')

const tabOptions = computed(() => {
  if (!user.value) return []

  if (user.value.role === 'student') {
    return [
      { name: 'Overview', value: 'overview' },
      { name: 'Analytics', value: 'analytics' },
    ]
  }

  if (user.value.role === 'lecturer') {
    return [
      { name: 'Overview', value: 'overview' },
      { name: 'Uploads', value: 'uploads' },
      { name: 'Analytics', value: 'analytics' },
    ]
  }

  return []
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <NavTabs v-model="activeTab" :options="tabOptions" direction="horizontal" />

    <div class="mt-4">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>
