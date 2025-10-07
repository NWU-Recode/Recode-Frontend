import type { Theme } from '@/lib/registry/themes'
import { themes } from '@/lib/registry/themes'

interface Config {
  theme?: Theme['name']
  radius: number
}

export function useCustomize() {
  const { value: colorMode } = useColorMode()
  const isDark = computed(() => colorMode === 'dark')

  const config = useCookie<Config>('config', {
    default: () => ({
      theme: 'neutral',
      radius: 0.5,
    }),
  })

  const themeClass = computed(() => `theme-${config.value.theme}`)
  const theme = computed(() => config.value.theme)
  const radius = computed(() => config.value.radius)

  function setTheme(themeName: Theme['name']) {
    config.value.theme = themeName
  }

  function setRadius(newRadius: number) {
    config.value.radius = newRadius
  }

  /** Get HSL for the primary color of the current theme */
  const themePrimary = computed(() => {
    const t = themes.find(t => t.name === theme.value)
    if (!t) return ''
    return `hsl(${t.cssVars[isDark.value ? 'dark' : 'light'].primary})`
  })

  /** Get HSL for semantic colors: success, warning, destructive */
  function semanticColor(key: 'success' | 'warning' | 'destructive') {
    const t = themes.find(t => t.name === theme.value)
    if (!t) return ''
    return `hsl(${t.cssVars[isDark.value ? 'dark' : 'light'][key]})`
  }

  /** Get foreground color for current mode */
  const foreground = computed(() => {
    const t = themes.find(t => t.name === theme.value)
    if (!t) return ''
    return `hsl(${t.cssVars[isDark.value ? 'dark' : 'light'].foreground})`
  })

  return {
    themeClass,
    theme,
    setTheme,
    radius,
    setRadius,
    themePrimary,
    semanticColor,
    foreground,
    isDark,
  }
}