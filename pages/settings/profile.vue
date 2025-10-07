<script setup>
import { ref, onMounted } from 'vue'
import FunLoader from '~/components/FunLoader.vue'
import { useApiFetch } from '~/composables/useApiFetch'

const { apiFetch } = useApiFetch()
const profile = ref(null)
const pageLoading = ref(true)

const MIN_LOADER_TIME = 3000
const loaderStart = Date.now()

function setPageLoading(val) {
  if (!val) {
    const elapsed = Date.now() - loaderStart
    const remaining = Math.max(0, MIN_LOADER_TIME - elapsed)
    setTimeout(() => (pageLoading.value = false), remaining)
  } else {
    pageLoading.value = true
  }
}

onMounted(async () => {
  setPageLoading(true)
  try {
    profile.value = await apiFetch('/profiles/me')
  } catch (e) {
    console.error('Error fetching profile:', e.message || e)
  } finally {
    setPageLoading(false)
  }
})

// Handle updated profile from child
async function handleProfileUpdated(updatedProfile) {
  setPageLoading(true)
  try {
    const saved = await apiFetch('/profiles/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: updatedProfile,
    })
    profile.value = saved
  } catch (e) {
    console.error('Failed to update profile:', e)
  } finally {
    setPageLoading(false)
  }
}

</script>

<template>
  <SettingsLayout>
    <div class="relative min-h-[80vh]">
      <transition name="fade">
        <FunLoader v-if="pageLoading" />
      </transition>

      <div v-if="!pageLoading">
        <SettingsProfileForm
            :profile="profile"
            :setPageLoading="setPageLoading"
            @profile-updated="handleProfileUpdated"
        />
      </div>
    </div>
  </SettingsLayout>
</template>