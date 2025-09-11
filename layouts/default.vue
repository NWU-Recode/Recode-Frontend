<script setup lang="ts">
import { ref, watch, provide } from 'vue'
import { useAuth } from '~/composables/useAuth'
import FunLoader from '~/components/FunLoader.vue'

const { fetchUser, user } = useAuth()

// loader state
const pageLoading = ref(true)

// provide a setter so child pages can trigger loading
function setPageLoading(val: boolean) {
  pageLoading.value = val
}
provide('setPageLoading', setPageLoading)

// keep loader visible at least N ms for UX smoothness
const MIN_LOADER_TIME = 1200 // 1.2s feels snappy but smooth
const loaderStart = Date.now()

const init = async () => {
  pageLoading.value = true
  try {
    await fetchUser()
  } catch (err) {
    console.error('Error fetching user in default.vue', err)
  } finally {
    const elapsed = Date.now() - loaderStart
    const remaining = Math.max(0, MIN_LOADER_TIME - elapsed)
    setTimeout(() => {
      pageLoading.value = false
    }, remaining)
  }
}
init()

// if user suddenly becomes available (e.g., revalidated), stop loading
watch(user, (val) => {
  if (val !== undefined) {
    const elapsed = Date.now() - loaderStart
    const remaining = Math.max(0, MIN_LOADER_TIME - elapsed)
    setTimeout(() => {
      pageLoading.value = false
    }, remaining)
  }
})
</script>

<template>
  <SidebarProvider>
    <LayoutAppSidebar />
    <SidebarInset>
      <LayoutHeader />

      <div class="min-w-0 w-full flex-1 overflow-x-auto p-4 lg:p-6 relative">
        <!-- Loader with fade -->
        <transition name="fade">
          <FunLoader v-if="pageLoading || user === undefined" />
        </transition>

        <!-- Content slot -->
        <slot v-if="!pageLoading && user !== undefined" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
