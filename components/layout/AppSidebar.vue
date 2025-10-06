<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { useAuth } from '~/composables/useAuth'
import { getNavMenu } from '~/constants/menus'
import { useAppSettings } from '~/composables/useAppSettings'
import { ref, onMounted, computed } from 'vue'
import { Bell } from 'lucide-vue-next'
import { useApiFetch } from '~/composables/useApiFetch'

const { user } = useAuth()
const { sidebar } = useAppSettings()
const { apiFetch } = useApiFetch()

// Existing sidebar functions
function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')

  return resolveComponent('LayoutSidebarNavLink')
}

const navMenu = computed(() => user.value ? getNavMenu(user.value) : [])

// --- 🔔 Notification logic ---
interface Notification {
  id: number
  title: string
  description: string
  read: boolean
  created_at: string
}

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const dropdownOpen = ref(false)

async function fetchNotifications() {
  if (!user.value?.id) return
  try {
    const data = await apiFetch(`/api/notifications?user_id=${user.value.id}&read=false`)
    notifications.value = data || []
    unreadCount.value = notifications.value.filter(n => !n.read).length
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
}

async function markAsRead(id: number) {
  try {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    notifications.value = notifications.value.map(n =>
        n.id === id ? { ...n, read: true } : n
    )
    unreadCount.value = notifications.value.filter(n => !n.read).length
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

onMounted(() => {
  fetchNotifications()
  setInterval(fetchNotifications, 60000) // auto-refresh every 60s
})
</script>

<template>
  <Sidebar :collapsible="sidebar.collapsible" :side="sidebar.side" :variant="sidebar.variant">
    <!-- ✅ Sidebar Header with Notification Bell -->
    <SidebarHeader class="relative flex flex-col items-center space-y-2">
      <img class="mx-auto mt-3 h-24 w-24" src="/logo.svg" alt="Logo">

      <!-- 🔔 Notification Bell -->
      <div class="relative">
        <button
            @click="toggleDropdown"
            class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none"
        >
          <Bell class="w-5 h-5 text-gray-700 dark:text-gray-200" />
          <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 animate-pulse"
          >
            {{ unreadCount }}
          </span>
        </button>


        <!-- Dropdown -->
        <div
            v-if="dropdownOpen"
            class="absolute left-1/2 mt-3 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-50"
            style="transform: translateX(0%);"
        >



        >
          <div class="p-3 border-b dark:border-neutral-700 flex justify-between items-center">
            <h3 class="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
            <button
                class="text-xs text-purple-500 hover:underline"
                @click="fetchNotifications"
            >
              Refresh
            </button>
          </div>

          <ul v-if="notifications.length > 0" class="max-h-80 overflow-y-auto">
            <li
                v-for="notif in notifications"
                :key="notif.id"
                class="p-3 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
                @click="markAsRead(notif.id)"
            >
              <div class="font-semibold text-gray-900 dark:text-gray-100">
                {{ notif.title }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ notif.description }}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {{ new Date(notif.created_at).toLocaleString() }}
              </div>
            </li>
          </ul>

          <div v-else class="p-4 text-gray-500 dark:text-gray-400 text-sm text-center">
            No new notifications
          </div>
        </div>
      </div>
    </SidebarHeader>

    <!-- ✅ Sidebar Content -->
    <SidebarContent>
      <template v-if="user === undefined">
        <div class="p-4 text-center text-sm text-muted-foreground">
          Loading menu...
        </div>
      </template>

      <template v-else-if="user === null">
        <div class="p-4 text-center text-sm text-muted-foreground">
          Not logged in
        </div>
      </template>

      <template v-else>
        <SidebarGroup v-for="(nav, indexGroup) in navMenu" :key="indexGroup">
          <SidebarGroupLabel v-if="nav.heading">{{ nav.heading }}</SidebarGroupLabel>
          <component
              :is="resolveNavItemComponent(item)"
              v-for="(item, index) in nav.items"
              :key="index"
              :item="item"
          />
        </SidebarGroup>
      </template>
    </SidebarContent>

    <!-- ✅ Sidebar Footer -->
    <SidebarFooter>
      <LayoutSidebarNavFooter
          v-if="user"
          :user="{
          name: user.full_name,
          email: user.email,
          avatar: user.avatar_url,
        }"
      />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
