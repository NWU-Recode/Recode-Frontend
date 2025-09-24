import { createSharedComposable, useActiveElement } from '@vueuse/core'
import { ref, computed, onMounted } from 'vue'

export function _useShortcuts() {
  const macOS = ref(false)
  const metaSymbol = ref(' ')

  const activeElement = useActiveElement()
  const usingInput = computed(() => {
    const tagName = activeElement.value?.tagName
    const contentEditable = activeElement.value?.contentEditable
    const usingInput =
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        contentEditable === 'true' ||
        contentEditable === 'plaintext-only'

    if (usingInput) {
      return (activeElement.value as any)?.name || true
    }

    return false
  })

  onMounted(() => {
    macOS.value = navigator.userAgent.includes('Macintosh')
    metaSymbol.value = macOS.value ? '⌘' : 'Ctrl'
  })

  return {
    macOS,
    metaSymbol,
    activeElement,
    usingInput,
  }
}

export const useShortcuts = createSharedComposable(_useShortcuts)
