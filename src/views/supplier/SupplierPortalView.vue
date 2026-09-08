<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconPlus from '~icons/ph/plus-duotone'
import IconEdit from '~icons/ph/pencil-simple-duotone'
import IconDelete from '~icons/ph/trash-duotone'
import { message, Modal } from 'ant-design-vue'
import { useSupplierProductsStore, type SupplierProduct } from '@/stores/supplierProducts'
import { usePurchasesStore } from '@/stores/purchases'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const supplierProductsStore = useSupplierProductsStore()
const purchasesStore = usePurchasesStore()

const supplierId = computed(() => auth.supplierUser?.id ?? '')
const myProducts = computed(() => supplierProductsStore.bySupplier(supplierId.value).value)
const myPurchases = computed(() => purchasesStore.bySupplier(supplierId.value).value)

const units = ['kg', 'dona', 'litr', 'm']

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  unit: 'kg',
  price: 0,
  quantity: 0,
})

function resetForm() {
  form.name = ''
  form.unit = 'kg'
  form.price = 0
  form.quantity = 0
}

function openAdd() {
  editingId.value = null
  resetForm()
  modalOpen.value = true
}

function openEdit(record: SupplierProduct) {
  editingId.value = record.id
  form.name = record.name
  form.unit = record.unit
  form.price = record.price
  form.quantity = record.quantity
  modalOpen.value = true
}

function handleOk() {
  if (!form.name.trim()) {
    message.error(t('supplierPortal.requireName'))
    return
  }
  if (editingId.value) {
    supplierProductsStore.updateProduct(editingId.value, { ...form })
    message.success(t('supplierPortal.updated'))
  } else {
    supplierProductsStore.addProduct({ ...form, supplierId: supplierId.value })
    message.success(t('supplierPortal.added'))
  }
  modalOpen.value = false
}

function handleDelete(record: SupplierProduct) {
  Modal.confirm({
    title: t('supplierPortal.deleteTitle'),
    content: t('supplierPortal.deleteContent', { name: record.name }),
    okText: t('common.deleteAction'),
    okType: 'danger',
    cancelText: t('common.cancel'),
    onOk() {
      supplierProductsStore.removeProduct(record.id)
      message.success(t('supplierPortal.deleted'))
    },
  })
}
</script>

<template>
  <div>
    <a-tabs>
      <a-tab-pane key="products" :tab="t('supplierPortal.tabProducts')">
        <a-card :bordered="false" class="toolbar-card">
          <div class="toolbar">
            <div>
              <div class="toolbar-title">{{ t('supplierPortal.title') }}</div>
              <div class="toolbar-sub">{{ t('supplierPortal.subtitle', { n: myProducts.length }) }}</div>
            </div>
            <a-button type="primary" @click="openAdd">
              <template #icon><IconPlus /></template>
              {{ t('supplierPortal.add') }}
            </a-button>
          </div>
        </a-card>

        <a-card :bordered="false" style="margin-top: 16px">
          <a-table :data-source="myProducts" row-key="id" size="middle" :pagination="{ pageSize: 10 }">
            <a-table-column :title="t('supplierPortal.colName')" data-index="name" />
            <a-table-column :title="t('supplierPortal.colUnit')" data-index="unit" :width="90" />
            <a-table-column :title="t('supplierPortal.colPrice')" :width="140">
              <template #default="{ record }">{{ fmt(record.price) }}</template>
            </a-table-column>
            <a-table-column :title="t('supplierPortal.colQuantity')" :width="120">
              <template #default="{ record }">{{ fmt(record.quantity) }}</template>
            </a-table-column>
            <a-table-column :title="t('products.colActions')" :width="100" fixed="right">
              <template #default="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="openEdit(record)">
                    <template #icon><IconEdit /></template>
                  </a-button>
                  <a-button type="text" size="small" danger @click="handleDelete(record)">
                    <template #icon><IconDelete /></template>
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </a-table>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="history" :tab="t('supplierPortal.tabHistory')">
        <a-card :bordered="false">
          <a-table :data-source="myPurchases" row-key="id" size="middle" :pagination="{ pageSize: 10 }">
            <a-table-column :title="t('supplierPortal.colTime')" :width="160">
              <template #default="{ record }">{{ fmtDate(record.timestamp) }}</template>
            </a-table-column>
            <a-table-column :title="t('supplierPortal.colProduct')" data-index="productName" />
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
      v-model:open="modalOpen"
      :title="editingId ? t('supplierPortal.editTitle') : t('supplierPortal.addTitle')"
      :ok-text="t('common.save')"
      :cancel-text="t('common.cancel')"
      width="480px"
      @ok="handleOk"
    >
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="16">
            <a-form-item :label="t('supplierPortal.nameLabel')">
              <a-input v-model:value="form.name" :placeholder="t('supplierPortal.namePlaceholder')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('products.colUnit')">
              <a-select v-model:value="form.unit" :options="units.map((u) => ({ value: u, label: u }))" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('supplierPortal.colPrice')">
              <a-input-number v-model:value="form.price" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('supplierPortal.colQuantity')">
              <a-input-number v-model:value="form.quantity" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.toolbar-card :deep(.ant-card-body) {
  padding: 18px 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.toolbar-sub {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
