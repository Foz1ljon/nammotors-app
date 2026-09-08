import { ref } from 'vue'
import { defineStore } from 'pinia'

const DISMISS_KEY = 'nammotors_pwa_install_dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const useInstallPromptStore = defineStore('installPrompt', () => {
  const deferredEvent = ref<BeforeInstallPromptEvent | null>(null)
  const visible = ref(false)
  const installed = ref(false)

  function init() {
    if (typeof window === 'undefined') return

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredEvent.value = e as BeforeInstallPromptEvent
      if (!localStorage.getItem(DISMISS_KEY)) {
        visible.value = true
      }
    })

    window.addEventListener('appinstalled', () => {
      installed.value = true
      visible.value = false
      deferredEvent.value = null
    })
  }

  async function install() {
    const evt = deferredEvent.value
    if (!evt) return
    visible.value = false
    await evt.prompt()
    await evt.userChoice
    deferredEvent.value = null
  }

  function dismiss() {
    visible.value = false
    localStorage.setItem(DISMISS_KEY, '1')
  }

  return { visible, installed, init, install, dismiss }
})
