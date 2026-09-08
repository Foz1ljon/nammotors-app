import { theme as antdTheme } from 'ant-design-vue'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import type { ThemeMode } from '@/stores/theme'

export const brand = {
  primary: '#0E5C97',
  primaryDark: '#0A3D66',
  primaryLight: '#E8F1F9',
  accent: '#F2971D',
  navy: '#0A2A43',
  navySoft: '#123754',
  success: '#2F9E44',
  warning: '#F2971D',
  error: '#E0483E',
  bg: '#E7EDF4',
  bgDark: '#0B1520',
  surfaceDark: '#121D2B',
}

export function getAntTheme(mode: ThemeMode): ThemeConfig {
  const isDark = mode === 'dark'
  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: brand.primary,
      colorInfo: brand.primary,
      colorSuccess: brand.success,
      colorWarning: brand.warning,
      colorError: brand.error,
      borderRadius: 8,
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      colorBgLayout: isDark ? brand.bgDark : brand.bg,
    },
    components: {
      Layout: {
        colorBgHeader: isDark ? brand.surfaceDark : '#ffffff',
        colorBgBody: isDark ? brand.bgDark : brand.bg,
      },
      Menu: {
        colorItemBgSelected: brand.primary,
        colorItemTextSelected: '#ffffff',
      },
      Button: {
        controlHeight: 38,
      },
      Card: {
        borderRadiusLG: 12,
      },
    },
  }
}
