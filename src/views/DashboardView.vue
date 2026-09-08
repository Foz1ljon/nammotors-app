<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import IconWarning from '~icons/ph/warning-duotone'
import IconTayyor from '~icons/ph/check-circle-duotone'
import IconYarim from '~icons/ph/gear-six-duotone'
import IconXomashyo from '~icons/ph/cube-duotone'
import { useProductsStore, categoryMeta, type ProductCategory } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import type { PermissionKey } from '@/stores/employees'

const { t } = useI18n()
const store = useProductsStore()
const auth = useAuthStore()
const router = useRouter()

const allCards = [
  {
    key: 'tayyor' as ProductCategory,
    label: categoryMeta.tayyor.label,
    icon: IconTayyor,
    color: '#2F9E44',
    bg: 'rgba(47, 158, 68, 0.14)',
    route: 'products-tayyor',
    permission: 'products.tayyor' as PermissionKey,
  },
  {
    key: 'yarim' as ProductCategory,
    label: categoryMeta.yarim.label,
    icon: IconYarim,
    color: '#0E5C97',
    bg: 'rgba(14, 92, 151, 0.14)',
    route: 'products-yarim',
    permission: 'products.yarim' as PermissionKey,
  },
  {
    key: 'xomashyo' as ProductCategory,
    label: categoryMeta.xomashyo.label,
    icon: IconXomashyo,
    color: '#F2971D',
    bg: 'rgba(242, 151, 29, 0.16)',
    route: 'products-xomashyo',
    permission: 'products.xomashyo' as PermissionKey,
  },
]

const cards = computed(() =>
  allCards
    .filter((c) => auth.hasPermission(c.permission))
    .map((c) => ({ ...c, ...store.totals[c.key] })),
)

const allowedCategories = computed(() => allCards.filter((c) => auth.hasPermission(c.permission)).map((c) => c.key))

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n)
}

const lowStockItems = computed(() =>
  store.items
    .filter((p) => allowedCategories.value.includes(p.category))
    .filter((p) => store.statusOf(p) !== 'yetarli')
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 8),
)

const visibleTotals = computed(() => {
  const items = store.items.filter((p) => allowedCategories.value.includes(p.category))
  return {
    count: items.length,
    value: items.reduce((s, p) => s + p.quantity * p.price, 0),
  }
})

function statusTag(status: 'tugagan' | 'kam' | 'yetarli') {
  if (status === 'tugagan') return { color: 'error', text: t('status.tugagan') }
  if (status === 'kam') return { color: 'warning', text: t('status.kam') }
  return { color: 'success', text: t('status.yetarli') }
}

const maxCardValue = computed(() => Math.max(1, ...cards.value.map((c) => c.value)))

function barWidthPct(value: number) {
  return Math.max(3, (value / maxCardValue.value) * 100)
}

function fmtCompact(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} ${t('dashboard.billionSuffix')}`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} ${t('dashboard.millionSuffix')}`
  if (n >= 1_000) return `${Math.round(n / 1000)} ${t('dashboard.thousandSuffix')}`
  return String(n)
}

const statusBreakdown = computed(() => {
  const items = store.items.filter((p) => allowedCategories.value.includes(p.category))
  const total = items.length || 1
  const counts = { yetarli: 0, kam: 0, tugagan: 0 }
  for (const p of items) counts[store.statusOf(p)]++
  return [
    { key: 'yetarli', label: 'status.yetarli', color: '#2F9E44', count: counts.yetarli, pct: (counts.yetarli / total) * 100 },
    { key: 'kam', label: 'status.kam', color: '#F2971D', count: counts.kam, pct: (counts.kam / total) * 100 },
    { key: 'tugagan', label: 'status.tugagan', color: '#E0483E', count: counts.tugagan, pct: (counts.tugagan / total) * 100 },
  ]
})

const DONUT_RADIUS = 54
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS

const donutSegments = computed(() => {
  let offset = 0
  return statusBreakdown.value
    .filter((s) => s.count > 0)
    .map((s) => {
      const dash = (s.pct / 100) * DONUT_CIRCUMFERENCE
      const segment = { key: s.key, color: s.color, dasharray: `${dash} ${DONUT_CIRCUMFERENCE - dash}`, dashoffset: -offset }
      offset += dash
      return segment
    })
})
</script>

<template>
  <div>
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-label">{{ t('dashboard.totalPositions') }}</div>
          <div class="stat-value">{{ fmt(visibleTotals.count) }}</div>
          <div class="stat-foot">{{ t('dashboard.totalValue') }}: {{ fmt(visibleTotals.value) }} {{ t('common.som') }}</div>
        </a-card>
      </a-col>
      <a-col v-for="c in cards" :key="c.key" :xs="24" :sm="12" :lg="6">
        <a-card :bordered="false" class="stat-card" hoverable @click="router.push({ name: c.route })">
          <div class="stat-icon" :style="{ background: c.bg, color: c.color }">
            <component :is="c.icon" />
          </div>
          <div class="stat-label">{{ t(c.label) }}</div>
          <div class="stat-value">{{ fmt(c.count) }} <span class="stat-unit">{{ t('dashboard.positionsSuffix') }}</span></div>
          <div class="stat-foot">
            <a-tag v-if="c.low > 0" color="warning">{{ c.low }} {{ t('dashboard.lowCount') }}</a-tag>
            <a-tag v-else color="success">{{ t('dashboard.allSufficient') }}</a-tag>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :xs="24" :lg="14">
        <a-card :bordered="false" class="chart-card">
          <template #title>{{ t('dashboard.valueChartTitle') }}</template>
          <div v-if="cards.length" class="bar-chart">
            <div v-for="c in cards" :key="c.key" class="bar-row">
              <div class="bar-row-head">
                <span class="bar-label">{{ t(c.label) }}</span>
                <span class="bar-value">{{ fmtCompact(c.value) }} {{ t('common.som') }}</span>
              </div>
              <svg viewBox="0 0 100 10" preserveAspectRatio="none" class="bar-svg">
                <rect x="0" y="0" width="100" height="10" rx="5" class="bar-track-rect" />
                <rect x="0" y="0" :width="barWidthPct(c.value)" height="10" rx="5" :fill="c.color" class="bar-fill-rect" />
              </svg>
            </div>
          </div>
          <a-empty v-else :description="t('dashboard.noPermission')" />
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="10">
        <a-card :bordered="false" class="chart-card">
          <template #title>{{ t('dashboard.statusChartTitle') }}</template>
          <div class="donut-row">
            <svg viewBox="0 0 120 120" class="donut-svg">
              <circle cx="60" cy="60" r="54" fill="none" class="donut-track" stroke-width="14" />
              <circle
                v-for="seg in donutSegments"
                :key="seg.key"
                cx="60"
                cy="60"
                r="54"
                fill="none"
                :stroke="seg.color"
                stroke-width="14"
                :stroke-dasharray="seg.dasharray"
                :stroke-dashoffset="seg.dashoffset"
                stroke-linecap="round"
                transform="rotate(-90 60 60)"
                class="donut-segment"
              />
              <text x="60" y="56" text-anchor="middle" class="donut-center-value">{{ fmt(visibleTotals.count) }}</text>
              <text x="60" y="72" text-anchor="middle" class="donut-center-label">{{ t('dashboard.positionsSuffix') }}</text>
            </svg>

            <div class="status-legend">
              <div v-for="s in statusBreakdown" :key="s.key" class="legend-item">
                <span class="legend-dot" :style="{ background: s.color }" />
                <span class="legend-label">{{ t(s.label) }}</span>
                <span class="legend-count">{{ s.count }} {{ t('common.ta') }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false" class="low-stock-card" style="margin-top: 16px">
      <template #title>
        <span><IconWarning style="color: #f2971d; margin-right: 8px" />{{ t('dashboard.lowStockTableTitle') }}</span>
      </template>

      <a-table
        :data-source="lowStockItems"
        :pagination="false"
        row-key="id"
        size="middle"
        :scroll="{ x: 900 }"
      >
        <a-table-column :title="t('dashboard.colCode')" data-index="code" :width="110" />
        <a-table-column :title="t('dashboard.colName')" data-index="name" />
        <a-table-column :title="t('dashboard.colCategory')" :width="160">
          <template #default="{ record }">{{ t(categoryMeta[record.category as 'tayyor' | 'yarim' | 'xomashyo'].short) }}</template>
        </a-table-column>
        <a-table-column :title="t('dashboard.colRemaining')" :width="140">
          <template #default="{ record }">{{ fmt(record.quantity) }} {{ record.unit }}</template>
        </a-table-column>
        <a-table-column :title="t('dashboard.colMinStock')" :width="120">
          <template #default="{ record }">{{ fmt(record.minStock) }} {{ record.unit }}</template>
        </a-table-column>
        <a-table-column :title="t('dashboard.colStatus')" :width="120">
          <template #default="{ record }">
            <a-tag :color="statusTag(store.statusOf(record)).color">{{ statusTag(store.statusOf(record)).text }}</a-tag>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.stat-card {
  border-radius: 12px;
  cursor: pointer;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 10px;
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-bottom: 4px;
}

.stat-value {
  color: var(--color-text);
  font-size: 24px;
  font-weight: 700;
}

.stat-unit {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted);
}

.stat-foot {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.low-stock-card :deep(.ant-card-head-title) {
  font-weight: 600;
  color: var(--color-text);
}

.chart-card {
  height: 100%;
}

.chart-card :deep(.ant-card-head-title) {
  font-weight: 600;
  color: var(--color-text);
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bar-row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.bar-label {
  font-size: 13px;
  color: var(--color-text);
  font-weight: 500;
}

.bar-value {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.bar-svg {
  width: 100%;
  height: 10px;
  display: block;
}

.bar-track-rect {
  fill: var(--color-track);
}

.bar-fill-rect {
  transition: width 0.5s ease;
}

.donut-row {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

.donut-svg {
  width: 140px;
  height: 140px;
  flex: 0 0 auto;
}

.donut-track {
  stroke: var(--color-track);
}

.donut-segment {
  transition: stroke-dasharray 0.5s ease;
}

.donut-center-value {
  font-size: 20px;
  font-weight: 700;
  fill: var(--color-text);
}

.donut-center-label {
  font-size: 9px;
  fill: var(--color-text-muted);
}

.status-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 140px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.legend-label {
  color: var(--color-text);
  font-weight: 500;
}

.legend-count {
  color: var(--color-text-muted);
}
</style>
