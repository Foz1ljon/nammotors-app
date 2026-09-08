import { onMounted, onUnmounted, ref } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(!!document.fullscreenElement)

  function update() {
    isFullscreen.value = !!document.fullscreenElement
  }

  function toggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  onMounted(() => document.addEventListener('fullscreenchange', update))
  onUnmounted(() => document.removeEventListener('fullscreenchange', update))

  return { isFullscreen, toggle }
}
