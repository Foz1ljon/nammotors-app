<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ShoppingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useSupplierProductsStore, type SupplierProduct } from '@/stores/supplierProducts'
import { useSuppliersStore } from '@/stores/suppliers'
import { usePurchasesStore } from '@/stores/purchases'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const supplierProductsStore = useSupplierProductsStore()
const suppliersStore = useSuppliersStore()
const purchasesStore = usePurchasesStore()

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const catalog = computed(() =>
  supplierProductsStore.items.map((p) => ({
    ...p,
    companyName: suppliersStore.findById(p.supplierId)?.companyName ?? '-',
  })),
)

const buyModalOpen = ref(false)
const buyingRecord = ref<(SupplierProduct & { companyName: string }) | null>(null)
const buyQty = ref(1)

const buyTotal = computed(() => (buyingRecord.value ? buyQty.value * buyingRecord.value.price : 0))

function openBuyModal(record: SupplierProduct & { companyName: string }) {
  buyingRecord.value = record
  buyQty.value = 1
  buyModalOpen.value = true
}

function handleBuyOk() {
  const record = buyingRecord.value
  if (!record || !auth.user) return
  if (!buyQty.value || buyQty.value <= 0) {
    message.error(t('products.invalidQuantity'))
    return
  }
  if (buyQty.value > record.quantity) {
    message.error(t('products.insufficientStock'))
    return
  }

  supplierProductsStore.updateProduct(record.id, { quantity: record.quantity - buyQty.value })
  purchasesStore.record({
    supplierId: record.supplierId,
    supplierName: record.companyName,
    supplierProductId: record.id,
    productName: record.name,
    unit: record.unit,
    price: record.price,
    quantity: buyQty.value,
    total: buyQty.value * record.price,
    employeeUsername: auth.user.username,
    employeeFullName: auth.user.fullName,
  })

  message.success(t('supplierCatalog.purchaseSuccess'))
  buyModalOpen.value = false
}
</script>

<template>
  <div>
    <a-tabs>
      <a-tab-pane key="catalog" :tab="t('supplierCatalog.tabCatalog')">
        <a-card :bordered="false" class="toolbar-card">
          <div class="toolbar-title">{{ t('supplierCatalog.title') }}</div>
          <div class="toolbar-sub">{{ t('supplierCatalog.subtitle', { n: catalog.length }) }}</div>
        </a-card>

        <a-card :bordered="false" style="margin-top: 16px">
          <a-table :data-source="catalog" row-key="id" size="middle" :pagination="{ pageSize: 10 }">
            <a-table-column :title="t('supplierCatalog.colCompany')" data-index="companyName" />
            <a-table-column :title="t('supplierCatalog.colProduct')" data-index="name" />
            <a-table-column :title="t('products.colUnit')" data-index="unit" :width="90" />
            <a-table-column :title="t('supplierPortal.colPrice')" :width="140">
              <template #default="{ record }">{{ fmt(record.price) }}</template>
            </a-table-column>
            <a-table-column :title="t('supplierCatalog.colAvailable')" :width="130">
              <template #default="{ record }">{{ fmt(record.quantity) }}</template>
            </a-table-column>
            <a-table-column :title="t('products.colActions')" :width="120" fixed="right">
              <template #default="{ record }">
                <a-tooltip :title="t('supplierCatalog.buyTooltip')">
                  <a-button type="text" size="small" :disabled="record.quantity <= 0" @click="openBuyModal(record)">
                    <template #icon><ShoppingOutlined /></template>
                  </a-button>
                </a-tooltip>
              </template>
            </a-table-column>
          </a-table>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="history" :tab="t('supplierCatalog.tabHistory')">
        <a-card :bordered="false">
          <a-table :data-source="purchasesStore.sorted" row-key="id" size="middle" :pagination="{ pageSize: 10 }">
            <a-table-column :title="t('supplierPortal.colTime')" :width="160">
              <template #default="{ record }">{{ fmtDate(record.timestamp) }}</template>
            </a-table-column>
            <a-table-column :title="t('supplierCatalog.colCompany')" data-index="supplierName" />
            <a-table-column :title="t('supplierCatalog.colProduct')" data-index="productName" />
            <a-table-column :title="t('supplierPortal.colQuantity')" :width="120">
              <template #default="{ record }">{{ fmt(record.quantity) }} {{ record.unit }}</template>
            </a-table-column>
            <a-table-column :title="t('supplierPortal.colTotal')" :width="150">
              <template #default="{ record }">{{ fmt(record.total) }}</template>
            </a-table-column>
            <a-table-column :title="t('supplierPortal.colEmployee')" data-index="employeeFullName" />
          </a-table>
        </a-card>
      </a-tab-pane>
    </a-tabs>

    <a-modal
      v-model:open="buyModalOpen"
      :title="t('supplierCatalog.buyTitle')"
      :ok-text="t('supplierCatalog.buyConfirm')"
      :cancel-text="t('common.cancel')"
      width="420px"
      @ok="handleBuyOk"
    >
      <div v-if="buyingRecord" class="buy-info">
        <div class="buy-name">{{ buyingRecord.name }}</div>
        <div class="buy-meta">{{ buyingRecord.companyName }}</div>
        <div class="buy-meta">{{ t('supplierCatalog.colAvailable') }}: {{ fmt(buyingRecord.quantity) }} {{ buyingRecord.unit }}</div>
      </div>
      <a-form layout="vertical">
        <a-form-item :label="t('supplierCatalog.buyQuantityLabel')">
          <a-input-number v-model:value="buyQty" :min="1" :max="buyingRecord?.quantity" style="width: 100%" autofocus />
        </a-form-item>
        <div class="buy-total">{{ t('supplierCatalog.totalLabel') }}: <b>{{ fmt(buyTotal) }} {{ t('common.som') }}</b></div>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.toolbar-card :deep(.ant-card-body) {
  padding: 18px 20px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.toolbar-sub {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.buy-info {
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--color-surface-alt);
}

.buy-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.buy-meta {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.buy-total {
  font-size: 13px;
  color: var(--color-text);
}
</style>
