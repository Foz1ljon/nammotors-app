<script setup lang="ts">
import { computed } from 'vue'
import { getAntTheme } from '@/theme'
import { useThemeStore } from '@/stores/theme'
import InstallPromptModal from '@/components/InstallPromptModal.vue'

const themeStore = useThemeStore()
const antTheme = computed(() => getAntTheme(themeStore.mode))
</script>

<template>
  <a-config-provider :theme="antTheme">
    <router-view />
    <InstallPromptModal />
  </a-config-provider>
</template>
