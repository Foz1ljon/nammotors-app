import { createI18n } from 'vue-i18n'
import latin from './locales/latin'
import cyrillic from './locales/cyrillic'

export type LocaleCode = 'latin' | 'cyrillic'

export const LOCALE_STORAGE_KEY = 'nammotors_locale'

function getInitialLocale(): LocaleCode {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  return stored === 'cyrillic' ? 'cyrillic' : 'latin'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: 'latin',
  messages: {
    latin,
    cyrillic,
  },
})
