import { computed } from 'vue'
import { defineStore } from 'pinia'
import { i18n, LOCALE_STORAGE_KEY, type LocaleCode } from '@/i18n'

export const useLocaleStore = defineStore('locale', () => {
  const current = computed<LocaleCode>({
    get: () => i18n.global.locale.value as LocaleCode,
    set: (value) => {
      i18n.global.locale.value = value
      localStorage.setItem(LOCALE_STORAGE_KEY, value)
    },
  })

  function toggle() {
    current.value = current.value === 'latin' ? 'cyrillic' : 'latin'
  }

  function setLocale(value: LocaleCode) {
    current.value = value
  }

  return { current, toggle, setLocale }
})
