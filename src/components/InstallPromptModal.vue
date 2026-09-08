<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import IconInstall from '~icons/ph/download-simple-duotone'
import { useInstallPromptStore } from '@/stores/installPrompt'

const { t } = useI18n()
const store = useInstallPromptStore()
</script>

<template>
  <a-modal
    :open="store.visible"
    :closable="false"
    :footer="null"
    width="380px"
    centered
    @cancel="store.dismiss()"
  >
    <div class="install-prompt">
      <div class="install-icon"><IconInstall /></div>
      <h3 class="install-title">{{ t('pwa.installTitle') }}</h3>
      <p class="install-desc">{{ t('pwa.installDescription') }}</p>
      <div class="install-actions">
        <a-button block @click="store.dismiss()">{{ t('pwa.installLater') }}</a-button>
        <a-button type="primary" block @click="store.install()">{{ t('pwa.installNow') }}</a-button>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.install-prompt {
  text-align: center;
  padding: 8px 4px;
}

.install-icon {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
  color: #0e5c97;
  background: rgba(14, 92, 151, 0.12);
}

.install-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 6px;
}

.install-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0 0 20px;
  line-height: 1.5;
}

.install-actions {
  display: flex;
  gap: 10px;
}
</style>
