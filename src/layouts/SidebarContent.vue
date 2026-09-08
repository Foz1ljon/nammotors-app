<script setup lang="ts">
import { ref } from 'vue'
import {
  DashboardOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  DeploymentUnitOutlined,
  GoldOutlined,
  FolderOutlined,
  DatabaseOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TeamOutlined,
  HistoryOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'

defineProps<{
  collapsed?: boolean
  selectedKeys: string[]
  showClose?: boolean
}>()

const emit = defineEmits<{
  navigate: [key: string]
  close: []
}>()

const auth = useAuthStore()
const openKeys = ref<string[]>(['mahsulotlar', 'spravochnik'])

function handleMenuClick({ key }: MenuInfo) {
  emit('navigate', key as string)
}
</script>

<template>
  <div class="sidebar-inner">
    <div class="brand" :class="{ collapsed }">
      <div class="brand-mark">NM</div>
      <div v-if="!collapsed" class="brand-text">
        <div class="brand-title">NAMMOTORS</div>
        <div class="brand-sub">{{ $t('sidebar.brandSub') }}</div>
      </div>
      <CloseOutlined v-if="showClose" class="close-btn" @click="emit('close')" />
    </div>

    <a-menu
      theme="dark"
      mode="inline"
      :selected-keys="selectedKeys"
      v-model:open-keys="openKeys"
      @click="handleMenuClick"
    >
      <a-menu-item key="dashboard">
        <template #icon><DashboardOutlined /></template>
        {{ $t('sidebar.dashboard') }}
      </a-menu-item>

      <a-sub-menu
        v-if="auth.hasPermission('products.tayyor') || auth.hasPermission('products.yarim') || auth.hasPermission('products.xomashyo')"
        key="mahsulotlar"
      >
        <template #icon><AppstoreOutlined /></template>
        <template #title>{{ $t('sidebar.products') }}</template>
        <a-menu-item v-if="auth.hasPermission('products.tayyor')" key="products-tayyor">
          <template #icon><CheckCircleOutlined /></template>
          {{ $t('sidebar.productsTayyor') }}
        </a-menu-item>
        <a-menu-item v-if="auth.hasPermission('products.yarim')" key="products-yarim">
          <template #icon><DeploymentUnitOutlined /></template>
          {{ $t('sidebar.productsYarim') }}
        </a-menu-item>
        <a-menu-item v-if="auth.hasPermission('products.xomashyo')" key="products-xomashyo">
          <template #icon><GoldOutlined /></template>
          {{ $t('sidebar.productsXomashyo') }}
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu v-if="auth.hasPermission('models') || auth.hasPermission('warehouses')" key="spravochnik">
        <template #icon><FolderOutlined /></template>
        <template #title>{{ $t('sidebar.references') }}</template>
        <a-menu-item v-if="auth.hasPermission('models')" key="models">
          <template #icon><DatabaseOutlined /></template>
          {{ $t('sidebar.models') }}
        </a-menu-item>
        <a-menu-item v-if="auth.hasPermission('warehouses')" key="warehouses">
          <template #icon><ShopOutlined /></template>
          {{ $t('sidebar.warehouses') }}
        </a-menu-item>
      </a-sub-menu>

      <a-menu-item v-if="auth.hasPermission('suppliers')" key="suppliers">
        <template #icon><ShoppingOutlined /></template>
        {{ $t('sidebar.suppliers') }}
      </a-menu-item>

      <a-menu-item v-if="auth.hasPermission('employees')" key="employees">
        <template #icon><TeamOutlined /></template>
        {{ $t('sidebar.employees') }}
      </a-menu-item>

      <a-menu-item v-if="auth.hasPermission('logs')" key="logs">
        <template #icon><HistoryOutlined /></template>
        {{ $t('sidebar.logs') }}
      </a-menu-item>
    </a-menu>
  </div>
</template>

<style scoped>
.sidebar-inner {
  height: 100%;
  background: #0a2a43;
  display: flex;
  flex-direction: column;
}

.sidebar-inner :deep(.ant-menu-dark) {
  background: transparent !important;
}

.sidebar-inner :deep(.ant-menu-dark .ant-menu-sub) {
  background: #123754 !important;
}

.brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand.collapsed {
  justify-content: center;
  padding: 18px 0;
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
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.brand-sub {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
}

.close-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
}

.close-btn:hover {
  color: #fff;
}
</style>
