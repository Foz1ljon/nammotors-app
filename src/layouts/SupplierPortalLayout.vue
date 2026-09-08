<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { LogoutOutlined, BulbOutlined, BulbFilled, TranslationOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'

const { t } = useI18n()
const auth = useAuthStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const router = useRouter()

function handleLocaleClick({ key }: MenuInfo) {
  localeStore.setLocale(key as 'latin' | 'cyrillic')
}

function handleLogout() {
  auth.logoutSupplier()
  router.push({ name: 'login' })
}
</script>

<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header class="portal-header">
      <div class="header-left">
        <div class="brand-mark">NM</div>
        <div class="brand-text">
          <div class="brand-title">NAMMOTORS</div>
          <div class="brand-sub">{{ t('supplierPortal.brandSub') }}</div>
        </div>
      </div>

      <div class="header-right">
        <a-dropdown trigger="click">
          <TranslationOutlined class="header-icon" />
          <template #overlay>
            <a-menu @click="handleLocaleClick">
              <a-menu-item key="latin">{{ t('lang.latin') }}</a-menu-item>
              <a-menu-item key="cyrillic">{{ t('lang.cyrillic') }}</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <a-tooltip :title="themeStore.mode === 'dark' ? t('theme.light') : t('theme.dark')">
          <a-switch :checked="themeStore.mode === 'dark'" class="theme-switch" @change="themeStore.toggle()">
            <template #checkedChildren><BulbFilled /></template>
            <template #unCheckedChildren><BulbOutlined /></template>
          </a-switch>
        </a-tooltip>

        <div class="user-chip">
          <a-avatar style="background-color: #0e5c97">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <div class="user-meta">
            <div class="user-name">{{ auth.supplierUser?.companyName }}</div>
          </div>
        </div>

        <a-tooltip :title="t('header.logout')">
          <LogoutOutlined class="header-icon" @click="handleLogout" />
        </a-tooltip>
      </div>
    </a-layout-header>

    <a-layout-content class="portal-content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
.portal-header {
  background: var(--color-surface);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0e5c97, #0a3d66);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-title {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-text);
  letter-spacing: 0.5px;
}

.brand-sub {
  font-size: 11px;
  color: var(--color-text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 0 0 auto;
}

.header-icon {
  font-size: 18px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.theme-switch {
  background: var(--color-track);
}

.theme-switch.ant-switch-checked {
  background: #0e5c97;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.portal-content {
  padding: 24px;
}

@media (max-width: 768px) {
  .portal-header {
    padding: 0 12px;
  }

  .header-right {
    gap: 12px;
  }

  .user-meta {
    display: none;
  }

  .portal-content {
    padding: 14px;
  }
}
</style>
