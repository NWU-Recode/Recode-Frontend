<script setup lang="ts">
import { themes } from '@/lib/registry/themes'

const { theme, radius, setTheme, setRadius } = useCustomize()

// Define the available theme "keys"
type ThemeName =
    | 'primary'      // purple-400
    | 'secondary'    // blue-400
    | 'tertiary'     // pink-400
    | 'neutral'      // neutral-400
    | 'success'      // green-400
    | 'warning'      // yellow-400
    | 'destructive'  // red-400


// Array of theme options to render
const allThemes: ThemeName[] = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'success',
  'warning',
  'destructive',
]

const RADII = [0, 0.25, 0.5, 0.75, 1]

// reactively watch theme + radius and update DOM
watch(theme, () => {
  setClassTheme()
})
watch(radius, () => {
  setStyleRadius()
})

function setClassTheme() {
  document.body.classList.remove(
      ...allThemes.map(t => `theme-${t}`),
  )
  document.body.classList.add(`theme-${theme.value}`)
}

function setStyleRadius() {
  document.body.style.setProperty('--radius', `${radius.value}rem`)
}

function backgroundColor(name: ThemeName) {
  const themeDef = themes[0]
  const color = themeDef.cssVars.light[name]
  return `hsl(${color})`
}


const colorMode = useColorMode()
</script>

<template>
  <div class="grid gap-6">
    <div class="space-y-1.5">
      <Label>Theme</Label>
      <div class="grid grid-cols-3 gap-2">
        <Button
          class="justify-center gap-2"
          variant="outline"
          :class="{ 'border-primary border-2': colorMode.preference === 'light' }"
          @click="colorMode.preference = 'light'"
        >
          <Icon name="i-ph-sun-dim-duotone" size="16" />
          <span class="text-xs capitalize">Light</span>
        </Button>
        <Button
          class="justify-center gap-2"
          variant="outline"
          :class="{ 'border-primary border-2': colorMode.preference === 'dark' }"
          @click="colorMode.preference = 'dark'"
        >
          <Icon name="i-ph-moon-stars-duotone" size="16" />
          <span class="text-xs capitalize">Dark</span>
        </Button>
        <Button
          class="justify-center gap-2"
          variant="outline"
          :class="{ 'border-primary border-2': colorMode.preference === 'system' }"
          @click="colorMode.preference = 'system'"
        >
          <Icon name="i-lucide-monitor" size="16" />
          <span class="text-xs capitalize">System</span>
        </Button>
      </div>
    </div>
  </div>
</template>
