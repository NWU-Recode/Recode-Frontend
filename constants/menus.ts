import type { NavMenu, NavMenuItems } from '~/types/nav'

export function getNavMenu(user: any): NavMenu[] {
  if (!user) return []

  switch (user.role) {
    case 'student':
      return [
        {
          heading: '',
          items: [
            { title: 'Dashboard', icon: 'i-lucide-home', link: '/' },
            { title: 'Coding challenge', icon: 'i-lucide-code', link: '/coding-challenge' },
          ],
        },
      ]

    case 'lecturer':
      return [
        {
          heading: '',
          items: [
            { title: 'Dashboard', icon: 'i-lucide-home', link: '/' },
          ],
        },
      ]

    /*
    case 'admin':
      return [
        {
          heading: '',
          items: [
            { title: 'Dashboard', icon: 'i-lucide-home', link: '/' },
          ],
        },
      ]
     */

    default:
      return []
  }
}

export const navMenuBottom: NavMenuItems = [
  { title: 'Help & Support', icon: 'i-lucide-circle-help', link: 'https://github.com/dianprata/nuxt-shadcn-dashboard' },
  { title: 'Feedback', icon: 'i-lucide-send', link: 'https://github.com/dianprata/nuxt-shadcn-dashboard' },
]
