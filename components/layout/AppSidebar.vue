<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { navMenu, navMenuBottom } from '~/constants/menus'

function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')

  return resolveComponent('LayoutSidebarNavLink')
}

const user: {
  name: string
  email: string
  avatar: string
} = {
  name: 'Dian Pratama',
  email: 'dianpratama2@gmail.com',
  avatar: '/avatars/avatartion.png',
}

const { sidebar } = useAppSettings()
</script>

<template>
  <Sidebar :collapsible="sidebar.collapsible" :side="sidebar.side" :variant="sidebar.variant">
    <SidebarHeader>
      <img
          class="w-24 h-24 mx-auto mt-3"
          src="/public/logo.svg"
          alt="Logo"
      />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup v-for="(nav, indexGroup) in navMenu" :key="indexGroup">
        <SidebarGroupLabel v-if="nav.heading">
          {{ nav.heading }}
        </SidebarGroupLabel>
        <component :is="resolveNavItemComponent(item)" v-for="(item, index) in nav.items" :key="index" :item="item" />
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <LayoutSidebarNavFooter :user="user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>

<style scoped>

</style>
