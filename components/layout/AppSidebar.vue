<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { useAuth } from '~/composables/useAuth'
import {getNavMenu} from "~/constants/menus";

const { user } = useAuth()
const { sidebar } = useAppSettings()

function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')

  return resolveComponent('LayoutSidebarNavLink')
}

const navMenu = computed(() => getNavMenu(user.value))
</script>

<template>
  <Sidebar :collapsible="sidebar.collapsible" :side="sidebar.side" :variant="sidebar.variant">
    <SidebarHeader>
      <img
          class="w-24 h-24 mx-auto mt-3"
          src="/logo.svg"
          alt="Logo"
      />
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup v-for="(nav, indexGroup) in navMenu" :key="indexGroup">
        <SidebarGroupLabel v-if="nav.heading">
          {{ nav.heading }}
        </SidebarGroupLabel>
        <component
            v-for="(item, index) in nav.items"
            :is="resolveNavItemComponent(item)"
            :key="index"
            :item="item"
        />
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <LayoutSidebarNavFooter
          v-if="user"
          :user="{
          name: user.full_name,
          email: user.email,
          avatar: user.avatar_url || '/avatars/default.png'
        }"
      />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
