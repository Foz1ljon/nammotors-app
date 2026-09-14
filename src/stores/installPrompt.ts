import { ref } from 'vue'
import { defineStore } from 'pinia'

const DISMISS_KEY = 'nammotors_pwa_install_dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallPlatform = 'chromium' | 'ios-safari' | 'mac-safari'

// Safari (iOS and macOS) never fires `beforeinstallprompt` — it's a Chromium-only
// API — so Safari users must be walked through the manual "Add to Home Screen" /
// "Add to Dock" flow instead of the native programmatic prompt.
function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isSafari() {
  return /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent)
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
}

export const useInstallPromptStore = defineStore('installPrompt', () => {
  const deferredEvent = ref<BeforeInstallPromptEvent | null>(null)
  const visible = ref(false)
  const installed = ref(false)
  const platform = ref<InstallPlatform>('chromium')

  function init() {
    if (typeof window === 'undefined') return

    if (isStandalone()) {
      installed.value = true
      return
    }

    if (isSafari()) {
      platform.value = isIos() ? 'ios-safari' : 'mac-safari'
      if (!localStorage.getItem(DISMISS_KEY)) {
        visible.value = true
      }
      return
    }

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

  return { visible, installed, platform, init, install, dismiss }
})
