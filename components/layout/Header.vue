<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Bell, RefreshCw, Trash2 } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useApiFetch } from '@/composables/useApiFetch'

const { apiFetch } = useApiFetch()
const route = useRoute()

// Breadcrumbs
function setLinks() {
  if (route.fullPath === '/') return [{ title: 'Home', href: '/' }]
  const segments = route.fullPath.split('/').filter(item => item !== '')
  return segments.map((item, index) => {
    const title = item.replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    return { title, href: `/${segments.slice(0, index + 1).join('/')}` }
  })
}

const links = ref(setLinks())
watch(() => route.fullPath, () => links.value = setLinks())

// Notifications
interface Notification {
  id: string
  user_id: number
  title: string
  message: string
  type: string
  priority: number
  link_url: string
  expires_at: string
  created_at: string
  read: boolean
}

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const showDropdown = ref(false)
const isRefreshing = ref(false)
const filterUnread = ref(true)

async function fetchNotifications(onlyUnread = filterUnread.value, limit = 100) {
  try {
    isRefreshing.value = true
    const params = new URLSearchParams()
    params.append('only_unread', String(onlyUnread))
    params.append('limit', String(limit))

    const data: Notification[] = await apiFetch(`/notifications/me?${params.toString()}`)
    notifications.value = data || []
    unreadCount.value = notifications.value.filter(n => !n.read).length
  } catch (err) {
    console.error('Error fetching notifications:', err)
  } finally {
    isRefreshing.value = false
  }
}

async function markAsRead(notificationId: string) {
  try {
    await apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' })
    const notif = notifications.value.find(n => n.id === notificationId)
    if (notif) notif.read = true
    unreadCount.value = notifications.value.filter(n => !n.read).length
  } catch (err) {
    console.error('Error marking notification as read:', err)
  }
}

async function deleteNotification(notificationId: string) {
  try {
    await apiFetch(`/notifications/${notificationId}`, { method: 'DELETE' })
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
    unreadCount.value = notifications.value.filter(n => !n.read).length
  } catch (err) {
    console.error('Error deleting notification:', err)
  }
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) fetchNotifications()
}

function setFilter(showUnread: boolean) {
  filterUnread.value = showUnread
  fetchNotifications()
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <header class="sticky top-0 z-10 h-53px flex items-center gap-4 border-b bg-background px-4 md:px-6">
    <div class="w-full flex items-center gap-4">
      <SidebarTrigger />
      <Separator orientation="vertical" class="h-4" />
      <BaseBreadcrumbCustom :links="links" />
    </div>

    <!-- Notification Bell -->
    <div class="ml-auto relative">
      <button @click="toggleDropdown" class="relative">
        <Bell class="w-5 h-5" />
        <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-400 text-white text-xs font-bold rounded-full h-3 w-3 flex items-center justify-center"
        >
          {{ unreadCount }}
        </span>
      </button>

      <!-- Dropdown -->
      <div
          v-if="showDropdown"
          class="absolute -right-1 mt-6 w-100 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-2 border-b">
          <span class="font-medium text-sm">Notifications</span>
          <div class="flex items-center gap-2">
            <button @click="fetchNotifications">
              <RefreshCw :class="['w-4 h-4', isRefreshing ? 'animate-spin text-blue-400' : '']" />
            </button>
            <!-- Filter -->
            <select v-model="filterUnread" @change="setFilter(filterUnread)" class="text-xs bg-background border rounded px-1 py-0.5">
              <option :value="true">Unread</option>
              <option :value="false">All</option>
            </select>
          </div>
        </div>

        <!-- Notifications -->
        <div v-if="notifications.length === 0" class="p-4 text-center text-neutral-500">
          No notifications
        </div>
        <ul v-else>
          <li
              v-for="n in notifications"
              :key="n.id"
              class="px-4 py-2 hover:bg-purple-400 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
          >
            <!-- Notification message with unread dot -->
            <span
                @click="markAsRead(n.id)"
                class="flex-1 flex items-center text-sm gap-2"
            >
              {{ n.message }}
              <span
                  v-if="!n.read"
                  class="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"
              ></span>
            </span>

            <!-- Delete button -->
            <button @click.stop.prevent="deleteNotification(n.id)">
              <Trash2 class="w-4 h-4 text-red-500" />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div>
      <slot />
    </div>
  </header>
</template>
