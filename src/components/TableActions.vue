<script setup lang="ts">
  import IconMore from "~icons/ph/dots-three-vertical-duotone";
  import type { MenuInfo } from "ant-design-vue/es/menu/src/interface";

  export interface RowAction {
    key: string;
    label: string;
    icon: unknown;
    danger?: boolean;
    disabled?: boolean;
    tooltip?: string;
  }

  const props = defineProps<{
    actions: RowAction[];
    compact?: boolean;
  }>();

  const emit = defineEmits<{
    action: [key: string];
  }>();

  function handleMenuClick({ key }: MenuInfo) {
    emit("action", key as string);
  }
</script>

<template>
  <a-space v-if="!compact">
    <a-tooltip v-for="a in actions" :key="a.key" :title="a.tooltip">
      <a-button type="text" size="small" :danger="a.danger" :disabled="a.disabled" @click="emit('action', a.key)">
        <template #icon><component :is="a.icon" /></template>
      </a-button>
    </a-tooltip>
  </a-space>
  <a-dropdown v-else trigger="click" placement="bottomRight">
    <a-button type="text" size="small">
      <template #icon><IconMore /></template>
    </a-button>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item v-for="a in props.actions" :key="a.key" :danger="a.danger" :disabled="a.disabled">
          <span class="flex! items-center! gap-2">
            <component :is="a.icon" class="shrink-0" />
            <span>{{ a.label }}</span>
          </span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
