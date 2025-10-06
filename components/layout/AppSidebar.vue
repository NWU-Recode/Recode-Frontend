<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { useAuth } from '~/composables/useAuth'
import { getNavMenu } from '~/constants/menus'

const { user } = useAuth()
const { sidebar } = useAppSettings()

function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')

  return resolveComponent('LayoutSidebarNavLink')
}

const navMenu = computed(() => user.value ? getNavMenu(user.value) : [])
</script>

<template>
  <Sidebar :collapsible="sidebar.collapsible" :side="sidebar.side" :variant="sidebar.variant">
    <SidebarHeader>
      <img
          class="mx-auto mt-3 h-24 w-24"
          src="/logo.svg"
          alt="Logo"
      >
    </SidebarHeader>

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