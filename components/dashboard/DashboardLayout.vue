<script setup>
import { computed, ref } from 'vue'
import NavTabs from '~/components/ui/tabs/NavTabs.vue'
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()

const activeTab = ref('overview')

const tabOptions = computed(() => {
  if (!user.value)
    return []

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
  <div class="w-full flex justify-end items-center mb-4">
    <NavTabs v-model="activeTab" :options="tabOptions" direction="horizontal" />
  </div>

  <div>
    <slot :active-tab="activeTab" />
  </div>
</template>
