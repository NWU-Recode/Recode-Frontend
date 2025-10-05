<script setup>
import { ref, onMounted } from 'vue'
import FunLoader from '~/components/FunLoader.vue'
import { useApiFetch } from '~/composables/useApiFetch'

const { apiFetch } = useApiFetch()

// page state
const profile = ref(null)
const modules = ref(null)
const pageLoading = ref(true)

// dummy modules fallback
const dummyModules = [
  { id: 1, name: 'Python Introduction', code: 'CMPG111', enabled: true },
  { id: 2, name: 'Networks', code: 'CMPG115', enabled: false },
]

const MIN_LOADER_TIME = 3000
const loaderStart = Date.now()

function setPageLoading(val) {
  if (!val) {
    const elapsed = Date.now() - loaderStart
    const remaining = Math.max(0, MIN_LOADER_TIME - elapsed)
    setTimeout(() => {
      pageLoading.value = false
    }, remaining)
  } else {
    pageLoading.value = true
  }
}

onMounted(async () => {
  setPageLoading(true)
  try {
    // fetch logged-in user
    profile.value = await apiFetch('/profiles/me')

    // fetch modules — replace with real API when ready
    // for now, just use dummy modules
    modules.value = dummyModules

    // if needed, filter modules differently for lecturers vs students
    if (profile.value?.role === 'lecturer') {
      modules.value = modules.value.map(m => ({ ...m, canEdit: true }))
    }
  } catch (e) {
    console.error('Error fetching modules or profile:', e.message || e)
  } finally {
    setPageLoading(false)
  }
})
</script>

<template>
  <SettingsLayout>
    <div class="relative min-h-[80vh]">
      <transition name="fade">
        <FunLoader v-if="pageLoading" />
      </transition>

      <div v-if="!pageLoading && modules && profile">
        <SettingsModulesForm
            :modules="modules"
            :profile="profile"
            :setPageLoading="setPageLoading"
        />
      </div>
    </div>
  </SettingsLayout>
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
