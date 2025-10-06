<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Bell, RefreshCw } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()

function setLinks() {
  if (route.fullPath === '/') {
    return [{ title: 'Home', href: '/' }]
  }

  const segments = route.fullPath.split('/').filter(item => item !== '')

  const breadcrumbs = segments.map((item, index) => {
    const str = item.replace(/-/g, ' ')
    const title = str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

    return {
      title,
      href: `/${segments.slice(0, index + 1).join('/')}`,
    }
  })

  return [...breadcrumbs]
}

const links = ref<{ title: string; href: string }[]>(setLinks())

watch(() => route.fullPath, (val) => {
  if (val) {
    links.value = setLinks()
  }
})

// -------------------- Notifications --------------------
const notifications = ref<any[]>([])
const unreadCount = ref(0)
const showDropdown = ref(false)
const isRefreshing = ref(false)
const userId = 1 // Replace with actual user ID

async function fetchNotifications() {
  try {
    isRefreshing.value = true
    const res = await fetch(`/api/notifications?user_id=${userId}&read=false`)
    if (res.ok) {
      notifications.value = await res.json()
      unreadCount.value = notifications.value.length
    }
  } catch (err) {
    console.error('Error fetching notifications:', err)
  } finally {
    isRefreshing.value = false
  }
}

async function markAsRead(id: number) {
  try {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    notifications.value = notifications.value.filter(n => n.id !== id)
    unreadCount.value = notifications.value.length
  } catch (err) {
    console.error('Error marking notification as read:', err)
  }
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    fetchNotifications()
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <header class="sticky top-0 z-10 h-53px flex items-center gap-4 border-b bg-background px-4 md:px-6 relative">
    <div class="w-full flex items-center gap-4">
      <SidebarTrigger />
      <Separator orientation="vertical" class="h-4" />
      <BaseBreadcrumbCustom :links="links" />
    </div>

    <!-- Notification Bell -->
    <div class="ml-auto relative">
      <button @click="toggleDropdown" class="relative">
        <Bell class="w-6 h-6 text-gray-700" />
        <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center"
        >
          {{ unreadCount }}
        </span>
      </button>

      <!-- Dropdown -->
      <div
          v-if="showDropdown"
          class="absolute right-6 mt-3 w-64 bg-white border rounded-lg shadow-lg z-50"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <span class="font-medium text-sm text-gray-700">Notifications</span>
          <button @click="fetchNotifications" class="text-gray-500 hover:text-gray-700 transition">
            <RefreshCw
                :class="['w-4 h-4', isRefreshing ? 'animate-spin text-blue-500' : '']"
            />
          </button>
        </div>

        <!-- Notifications -->
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
          No new notifications
        </div>
        <ul v-else>
          <li
              v-for="n in notifications"
              :key="n.id"
              @click="markAsRead(n.id)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
          >
            {{ n.message }}
          </li>
        </ul>
      </div>
    </div>

    <div>
      <slot />
    </div>
  </header>
</template>

<style scoped>
/* no extra styles added */
</style>
