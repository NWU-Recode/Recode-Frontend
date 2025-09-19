<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Item {
  title: string
  href: string
}

const route = useRoute()

const sidebarNavItems: Item[] = [
  {
    title: 'Profile',
    href: '/settings/profile',
  },
  {
    title: 'Modules',
    href: '/settings/modules',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
  },
]
</script>

<template>
  <nav class="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1">
    <Button
      v-for="item in sidebarNavItems"
      :key="item.title"
      variant="ghost"
      :class="cn(
        'w-full text-left justify-start items-start rounded-md px-3 py-2 transition-all duration-150',
        route.path === item.href
          ? 'bg-purple-200 text-purple-600 font-semibold hover:bg-purple-200 hover:text-purple-600'
          : 'text-neutral-700 dark:text-neutral-200 hover:text-purple-600 hover:bg-transparent'
      )"
      as-child
    >
      <NuxtLink
        :to="item.href"
      >
        {{ item.title }}
      </NuxtLink>
    </Button>
  </nav>
</template>
