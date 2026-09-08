<script setup lang="ts">
import { ref } from 'vue'
import IconClose from '~icons/ph/x-duotone'
import IconDashboard from '~icons/ph/chart-line-duotone'
import IconProducts from '~icons/ph/package-duotone'
import IconTayyor from '~icons/ph/check-circle-duotone'
import IconYarim from '~icons/ph/gear-six-duotone'
import IconXomashyo from '~icons/ph/cube-duotone'
import IconReferences from '~icons/ph/folder-duotone'
import IconModels from '~icons/ph/tag-duotone'
import IconWarehouses from '~icons/ph/warehouse-duotone'
import IconCustomers from '~icons/ph/users-three-duotone'
import IconRepairs from '~icons/ph/wrench-duotone'
import IconSuppliers from '~icons/ph/truck-duotone'
import IconEmployees from '~icons/ph/identification-badge-duotone'
import IconLogs from '~icons/ph/clock-counter-clockwise-duotone'
import { useAuthStore } from '@/stores/auth'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'

const props = defineProps<{
  collapsed?: boolean
  selectedKeys: string[]
  showClose?: boolean
}>()

const emit = defineEmits<{
  navigate: [key: string]
  close: []
}>()

const auth = useAuthStore()

const PRODUCT_KEYS = ['products-tayyor', 'products-yarim', 'products-xomashyo']
const REFERENCE_KEYS = ['models', 'warehouses']

function initialOpenKeys(): string[] {
  const key = props.selectedKeys[0] ?? ''
  if (PRODUCT_KEYS.includes(key)) return ['mahsulotlar']
  if (REFERENCE_KEYS.includes(key)) return ['spravochnik']
  return ['mahsulotlar']
}

const openKeys = ref<string[]>(initialOpenKeys())

// Accordion behaviour: opening a submenu closes any other open submenu.
function handleOpenChange(keys: (string | number)[]) {
  const stringKeys = keys.map(String)
  const latestOpenKey = stringKeys.find((key) => !openKeys.value.includes(key))
  openKeys.value = latestOpenKey ? [latestOpenKey] : stringKeys
}

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
      <IconClose v-if="showClose" class="close-btn" @click="emit('close')" />
    </div>

    <a-menu
      theme="dark"
      mode="inline"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      @openChange="handleOpenChange"
      @click="handleMenuClick"
    >
      <a-menu-item key="dashboard">
        <template #icon><IconDashboard class="nav-icon" /></template>
        {{ $t('sidebar.dashboard') }}
      </a-menu-item>

      <a-sub-menu
        v-if="auth.hasPermission('products.tayyor') || auth.hasPermission('products.yarim') || auth.hasPermission('products.xomashyo')"
        key="mahsulotlar"
      >
        <template #icon><IconProducts class="nav-icon" /></template>
        <template #title>{{ $t('sidebar.products') }}</template>
        <a-menu-item v-if="auth.hasPermission('products.tayyor')" key="products-tayyor">
          <template #icon><IconTayyor class="nav-icon" /></template>
          {{ $t('sidebar.productsTayyor') }}
        </a-menu-item>
        <a-menu-item v-if="auth.hasPermission('products.yarim')" key="products-yarim">
          <template #icon><IconYarim class="nav-icon" /></template>
          {{ $t('sidebar.productsYarim') }}
        </a-menu-item>
        <a-menu-item v-if="auth.hasPermission('products.xomashyo')" key="products-xomashyo">
          <template #icon><IconXomashyo class="nav-icon" /></template>
          {{ $t('sidebar.productsXomashyo') }}
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu v-if="auth.hasPermission('models') || auth.hasPermission('warehouses')" key="spravochnik">
        <template #icon><IconReferences class="nav-icon" /></template>
        <template #title>{{ $t('sidebar.references') }}</template>
        <a-menu-item v-if="auth.hasPermission('models')" key="models">
          <template #icon><IconModels class="nav-icon" /></template>
          {{ $t('sidebar.models') }}
        </a-menu-item>
        <a-menu-item v-if="auth.hasPermission('warehouses')" key="warehouses">
          <template #icon><IconWarehouses class="nav-icon" /></template>
          {{ $t('sidebar.warehouses') }}
        </a-menu-item>
      </a-sub-menu>

      <a-menu-item v-if="auth.hasPermission('customers')" key="customers">
        <template #icon><IconCustomers class="nav-icon" /></template>
        {{ $t('sidebar.customers') }}
      </a-menu-item>

      <a-menu-item v-if="auth.hasPermission('repairs')" key="repairs">
        <template #icon><IconRepairs class="nav-icon" /></template>
        {{ $t('sidebar.repairs') }}
      </a-menu-item>

      <a-menu-item v-if="auth.hasPermission('suppliers')" key="suppliers">
        <template #icon><IconSuppliers class="nav-icon" /></template>
        {{ $t('sidebar.suppliers') }}
      </a-menu-item>

      <a-menu-item v-if="auth.hasPermission('employees')" key="employees">
        <template #icon><IconEmployees class="nav-icon" /></template>
        {{ $t('sidebar.employees') }}
      </a-menu-item>

      <a-menu-item v-if="auth.hasPermission('logs')" key="logs">
        <template #icon><IconLogs class="nav-icon" /></template>
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

.sidebar-inner :deep(.nav-icon) {
  font-size: 17px !important;
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
