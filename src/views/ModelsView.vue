<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { useModelsStore, type ProductModel } from '@/stores/models'
import { useProductsStore } from '@/stores/products'

const { t } = useI18n()
const store = useModelsStore()
const products = useProductsStore()

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const name = ref('')

function openAdd() {
  editingId.value = null
  name.value = ''
  modalOpen.value = true
}

function openEdit(record: ProductModel) {
  editingId.value = record.id
  name.value = record.name
  modalOpen.value = true
}

function handleOk() {
  if (!name.value.trim()) {
    message.error(t('models.nameRequired'))
    return
  }
  if (editingId.value) {
    store.updateModel(editingId.value, name.value)
    message.success(t('models.updated'))
  } else {
    store.addModel(name.value)
    message.success(t('models.added'))
  }
  modalOpen.value = false
}

function usageCount(modelName: string) {
  return products.items.filter((p) => p.model === modelName).length
}

function handleDelete(record: ProductModel) {
  const count = usageCount(record.name)
  if (count > 0) {
    message.warning(t('models.inUse', { n: count }))
    return
  }
  Modal.confirm({
    title: t('models.deleteTitle'),
    content: t('models.deleteContent', { name: record.name }),
    okText: t('common.deleteAction'),
    okType: 'danger',
    cancelText: t('common.cancel'),
    onOk() {
      store.removeModel(record.id)
      message.success(t('models.deleted'))
    },
  })
}
</script>

<template>
  <div>
    <a-card :bordered="false" class="toolbar-card">
      <div class="toolbar">
        <div>
          <div class="toolbar-title">{{ t('models.title') }}</div>
          <div class="toolbar-sub">{{ t('models.subtitle', { n: store.items.length }) }}</div>
        </div>
        <a-button type="primary" @click="openAdd">
          <template #icon><PlusOutlined /></template>
          {{ t('models.add') }}
        </a-button>
      </div>
    </a-card>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-table :data-source="store.items" row-key="id" size="middle" :pagination="{ pageSize: 10 }">
        <a-table-column :title="t('models.colName')" data-index="name" />
        <a-table-column :title="t('models.colUsage')">
          <template #default="{ record }">{{ usageCount(record.name) }} {{ t('models.usageSuffix') }}</template>
        </a-table-column>
        <a-table-column :title="t('products.colActions')" :width="100" fixed="right">
          <template #default="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="openEdit(record)">
                <template #icon><EditOutlined /></template>
              </a-button>
              <a-button type="text" size="small" danger @click="handleDelete(record)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="editingId ? t('models.editTitle') : t('models.addTitle')"
      :ok-text="t('common.save')"
      :cancel-text="t('common.cancel')"
      @ok="handleOk"
    >
      <a-form layout="vertical">
        <a-form-item :label="t('models.nameLabel')">
          <a-input v-model:value="name" :placeholder="t('models.namePlaceholder')" />
        </a-form-item>
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
