<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchOutlined } from '@ant-design/icons-vue'
import { useActivityLogStore, actionMeta, type LogAction } from '@/stores/activityLog'
import { categoryMeta, type ProductCategory } from '@/stores/products'

const { t } = useI18n()
const store = useActivityLogStore()

const search = ref('')
const actionFilter = ref<LogAction | 'all'>('all')
const categoryFilter = ref<ProductCategory | 'all'>('all')

const actionOptions = computed(() => [
  { value: 'all', label: t('logs.allActions') },
  ...(Object.keys(actionMeta) as LogAction[]).map((key) => ({ value: key, label: t(actionMeta[key].label) })),
])

const categoryOptions = computed(() => [
  { value: 'all', label: t('logs.allCategories') },
  ...(Object.keys(categoryMeta) as ProductCategory[]).map((key) => ({ value: key, label: t(categoryMeta[key].short) })),
])

const entries = computed(() =>
  store.sorted
    .filter((e) => actionFilter.value === 'all' || e.action === actionFilter.value)
    .filter((e) => categoryFilter.value === 'all' || e.category === categoryFilter.value)
    .filter((e) => {
      const q = search.value.trim().toLowerCase()
      if (!q) return true
      return (
        e.productName.toLowerCase().includes(q) ||
        e.productCode.toLowerCase().includes(q) ||
        e.userFullName.toLowerCase().includes(q)
      )
    }),
)

function fmtDate(iso: string) {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
</script>

<template>
  <div>
    <a-card :bordered="false" class="toolbar-card">
      <div class="toolbar">
        <div>
          <div class="toolbar-title">{{ t('logs.title') }}</div>
          <div class="toolbar-sub">{{ t('logs.subtitle', { n: entries.length }) }}</div>
        </div>
        <div class="toolbar-actions">
          <a-input v-model:value="search" :placeholder="t('logs.searchPlaceholder')" allow-clear class="search-input">
            <template #prefix><SearchOutlined style="color: rgba(0,0,0,0.3)" /></template>
          </a-input>
          <a-select v-model:value="actionFilter" :options="actionOptions" style="width: 170px" />
          <a-select v-model:value="categoryFilter" :options="categoryOptions" style="width: 190px" />
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-table :data-source="entries" row-key="id" size="middle" :pagination="{ pageSize: 15 }" :scroll="{ x: 950 }">
        <a-table-column :title="t('logs.colTime')" :width="150">
          <template #default="{ record }">{{ fmtDate(record.timestamp) }}</template>
        </a-table-column>
        <a-table-column :title="t('logs.colEmployee')" data-index="userFullName" :width="160" />
        <a-table-column :title="t('logs.colAction')" :width="130">
          <template #default="{ record }">
            <a-tag :color="actionMeta[record.action as LogAction].color">{{ t(actionMeta[record.action as LogAction].label) }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column :title="t('logs.colProduct')">
          <template #default="{ record }">
            <div class="product-cell">
              <span class="product-name">{{ record.productName }}</span>
              <span class="product-code">
                {{ record.productCode }}
                <template v-if="record.action === 'transferred'">— {{ record.fromWarehouse }} → {{ record.toWarehouse }}</template>
              </span>
            </div>
          </template>
        </a-table-column>
        <a-table-column :title="t('logs.colCategory')" :width="140">
          <template #default="{ record }">{{ t(categoryMeta[record.category as ProductCategory].short) }}</template>
        </a-table-column>
        <a-table-column :title="t('logs.colQuantity')" :width="110">
          <template #default="{ record }">{{ record.quantity != null ? record.quantity : '-' }}</template>
        </a-table-column>
      </a-table>

      <a-empty v-if="!entries.length" :description="t('logs.empty')" style="margin: 24px 0" />
    </a-card>
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

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 260px;
  max-width: 100%;
}

.product-cell {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 13px;
  color: var(--color-text);
}

.product-code {
  font-size: 12px;
  color: var(--color-text-muted);
}

@media (max-width: 576px) {
  .toolbar-actions {
    width: 100%;
  }

  .search-input {
    width: 100%;
    order: -1;
  }

  .toolbar-actions .ant-select {
    flex: 1;
    width: auto !important;
  }
}
</style>
