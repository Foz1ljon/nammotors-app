import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'nammotors_theme'

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getInitialMode())

  watch(
    mode,
    (value) => {
      document.documentElement.dataset.theme = value
      localStorage.setItem(STORAGE_KEY, value)
    },
    { immediate: true },
  )

  function toggle() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  function setMode(next: ThemeMode) {
    mode.value = next
  }

  return { mode, toggle, setMode }
})
