<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import {
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
  DeploymentUnitOutlined,
  GoldOutlined,
  BulbOutlined,
  BulbFilled,
  TranslationOutlined,
} from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'

const { t } = useI18n()
const auth = useAuthStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const form = reactive({ username: '', password: '', remember: true })
const rules = {
  username: [{ required: true, message: t('auth.usernameRequired') }],
  password: [{ required: true, message: t('auth.passwordRequired') }],
}
const submitting = ref(false)

async function onSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  submitting.value = true
  let ok = auth.login(form.username, form.password, form.remember)
  let isSupplier = false
  if (!ok) {
    ok = auth.loginSupplier(form.username, form.password, form.remember)
    isSupplier = ok
  }
  submitting.value = false
  if (ok) {
    const redirect = (route.query.redirect as string) || (isSupplier ? '/yetkazib-beruvchi-panel' : '/')
    router.push(redirect)
  }
}

function fillDemo(username: string, password: string) {
  form.username = username
  form.password = password
  auth.error = ''
}

const features = [
  { icon: CheckCircleOutlined, key: 'auth.featureFinished' },
  { icon: DeploymentUnitOutlined, key: 'auth.featureSemi' },
  { icon: GoldOutlined, key: 'auth.featureRaw' },
]
</script>

<template>
  <div class="login-screen">
    <div class="top-actions">
      <a-dropdown trigger="click">
        <button type="button" class="theme-toggle">
          <TranslationOutlined />
        </button>
        <template #overlay>
          <a-menu @click="({ key }) => localeStore.setLocale(key as 'latin' | 'cyrillic')">
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
    </div>

    <div class="login-panel">
      <div class="brand-panel">
        <div class="brand-panel-inner">
          <div class="login-brand">
            <div class="login-logo">NM</div>
            <div class="login-brand-text">
              <div class="login-brand-title">NAMMOTORS</div>
              <div class="login-brand-sub">{{ t('auth.brandSub') }}</div>
            </div>
          </div>

          <h2 class="brand-heading">{{ t('auth.brandHeadingLine1') }} <br />{{ t('auth.brandHeadingLine2') }}</h2>

          <ul class="brand-features">
            <li v-for="f in features" :key="f.key">
              <component :is="f.icon" />
              <span>{{ t(f.key) }}</span>
            </li>
          </ul>
        </div>
        <div class="brand-glow"></div>
      </div>

      <div class="form-panel">
        <div class="form-panel-inner">
          <div class="login-brand mobile-only">
            <div class="login-logo">NM</div>
            <div class="login-brand-text">
              <div class="login-brand-title">NAMMOTORS</div>
              <div class="login-brand-sub">{{ t('auth.brandSub') }}</div>
            </div>
          </div>

          <h1 class="login-heading">{{ t('auth.welcome') }}</h1>
          <p class="login-subheading">{{ t('auth.subheading') }}</p>

          <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" @finish="onSubmit" class="login-form">
            <a-form-item :label="t('auth.usernameLabel')" name="username">
              <a-input
                v-model:value="form.username"
                size="large"
                :placeholder="t('auth.usernamePlaceholder')"
                autocomplete="username"
                autofocus
              >
                <template #prefix><UserOutlined style="color: rgba(0,0,0,0.3)" /></template>
              </a-input>
            </a-form-item>
            <a-form-item :label="t('auth.passwordLabel')" name="password">
              <a-input-password
                v-model:value="form.password"
                size="large"
                :placeholder="t('auth.passwordPlaceholder')"
                autocomplete="current-password"
              >
                <template #prefix><LockOutlined style="color: rgba(0,0,0,0.3)" /></template>
              </a-input-password>
            </a-form-item>

            <div class="login-options">
              <a-checkbox v-model:checked="form.remember">{{ t('auth.remember') }}</a-checkbox>
            </div>

            <a-alert v-if="auth.error" type="error" :message="t(auth.error)" show-icon class="login-error" />

            <a-button type="primary" size="large" html-type="submit" :loading="submitting" block class="login-submit">
              {{ t('auth.submit') }}
            </a-button>
          </a-form>

          <a-divider class="login-divider">{{ t('auth.demoAccounts') }}</a-divider>

          <div class="demo-chips">
            <button type="button" class="demo-chip" @click="fillDemo('admin', 'admin123')">
              <b>admin</b><span>{{ t('auth.roleAdmin') }}</span>
            </button>
            <button type="button" class="demo-chip" @click="fillDemo('ombor', 'ombor123')">
              <b>ombor</b><span>{{ t('auth.roleWarehouse') }}</span>
            </button>
            <button type="button" class="demo-chip" @click="fillDemo('ishchi', 'ishchi123')">
              <b>ishchi</b><span>{{ t('auth.roleLimited') }}</span>
            </button>
            <button type="button" class="demo-chip" @click="fillDemo('metallurg', 'metall123')">
              <b>metallurg</b><span>{{ t('auth.roleSupplier') }}</span>
            </button>
          </div>

          <div class="login-footer">{{ t('auth.footer') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-screen {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 24px;
}

.top-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-switch {
  background: var(--color-track);
}

.theme-switch.ant-switch-checked {
  background: #0e5c97;
}

.theme-toggle {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.theme-toggle:hover {
  color: var(--color-primary, #0e5c97);
  border-color: #0e5c97;
}

.login-panel {
  width: 100%;
  max-width: 920px;
  min-height: 560px;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: var(--color-surface);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 70px rgba(6, 26, 44, 0.22);
}

.brand-panel {
  position: relative;
  background: radial-gradient(circle at 25% 15%, #16466c 0%, #0a2a43 50%, #061a2c 100%);
  padding: 44px 40px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.brand-panel-inner {
  position: relative;
  z-index: 1;
}

.brand-glow {
  position: absolute;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(242, 151, 29, 0.25) 0%, rgba(242, 151, 29, 0) 70%);
  bottom: -120px;
  right: -100px;
}

.brand-heading {
  color: #fff;
  font-size: 26px;
  line-height: 1.35;
  font-weight: 700;
  margin: 36px 0 28px;
}

.brand-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.brand-features li :deep(svg) {
  font-size: 16px;
  color: #f2971d;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44px 40px;
}

.form-panel-inner {
  width: 100%;
  max-width: 340px;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.mobile-only {
  display: none;
  margin-bottom: 24px;
}

.login-logo {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0e5c97, #0a3d66);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
}

.login-brand-title {
  font-weight: 700;
  font-size: 15px;
  color: #fff;
  letter-spacing: 0.5px;
}

.brand-panel .login-brand-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.form-panel .login-brand-title {
  color: var(--color-text);
}

.form-panel .login-brand-sub {
  font-size: 12px;
  color: var(--color-text-muted);
}

.login-heading {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px;
}

.login-subheading {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0 0 22px;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  margin-top: -8px;
}

.login-error {
  margin-bottom: 16px;
}

.login-submit {
  background: #f2971d;
  border-color: #f2971d;
  font-weight: 600;
}

.login-submit:hover,
.login-submit:focus {
  background: #d97f0e !important;
  border-color: #d97f0e !important;
}

.login-divider {
  font-size: 12px;
  color: var(--color-text-faint);
  margin: 22px 0 16px;
}

.demo-chips {
  display: flex;
  gap: 10px;
}

.demo-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-alt);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  text-align: left;
}

.demo-chip:hover {
  border-color: #0e5c97;
  background: rgba(14, 92, 151, 0.12);
}

.demo-chip b {
  font-size: 12px;
  color: var(--color-text);
}

.demo-chip span {
  font-size: 11px;
  color: var(--color-text-muted);
}

.login-footer {
  text-align: center;
  font-size: 11px;
  color: var(--color-text-faint);
  margin-top: 24px;
}

@media (max-width: 760px) {
  .login-panel {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .brand-panel {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .form-panel {
    padding: 36px 24px;
  }
}
</style>
