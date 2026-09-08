<script setup lang="ts">
import { computed } from 'vue'
import { getAntTheme } from '@/theme'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const antTheme = computed(() => getAntTheme(themeStore.mode))
</script>

<template>
  <a-config-provider :theme="antTheme">
    <router-view />
  </a-config-provider>
</template>
