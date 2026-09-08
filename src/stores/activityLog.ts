import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ProductCategory } from './products'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

export type LogAction = 'added' | 'sold' | 'updated' | 'deleted' | 'transferred'

export interface LogEntry {
  id: string
  timestamp: string
  username: string
  userFullName: string
  action: LogAction
  productCode: string
  productName: string
  category: ProductCategory
  quantity?: number
  fromWarehouse?: string
  toWarehouse?: string
  note?: string
}

// label values are i18n message keys (see src/i18n/locales) — resolve with t() at the call site.
export const actionMeta: Record<LogAction, { label: string; color: string }> = {
  added: { label: 'action.added', color: 'success' },
  sold: { label: 'action.sold', color: 'processing' },
  updated: { label: 'action.updated', color: 'warning' },
  deleted: { label: 'action.deleted', color: 'error' },
  transferred: { label: 'action.transferred', color: 'blue' },
}

let nextId = 1
function id() {
  return `L${String(nextId++).padStart(5, '0')}`
}

function daysAgo(days: number, hour: number, minute: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const seed: Omit<LogEntry, 'id'>[] = [
  {
    timestamp: daysAgo(6, 9, 15),
    username: 'admin',
    userFullName: 'Administrator',
    action: 'added',
    productCode: 'TM-101',
    productName: 'Elektr dvigateli AIR 100S4',
    category: 'tayyor',
    quantity: 42,
  },
  {
    timestamp: daysAgo(6, 9, 40),
    username: 'admin',
    userFullName: 'Administrator',
    action: 'added',
    productCode: 'XM-301',
    productName: "Cho'yan quyma zagotovka",
    category: 'xomashyo',
    quantity: 3200,
  },
  {
    timestamp: daysAgo(5, 11, 5),
    username: 'ombor',
    userFullName: 'Ombor mudiri',
    action: 'sold',
    productCode: 'TM-105',
    productName: 'Kompressor dvigateli 4A',
    category: 'tayyor',
    quantity: 4,
  },
  {
    timestamp: daysAgo(5, 14, 20),
    username: 'ishchi',
    userFullName: 'Ishlab chiqarish ishchisi',
    action: 'updated',
    productCode: 'YT-202',
    productName: 'Rotor uzeli (mashinlangan)',
    category: 'yarim',
  },
  {
    timestamp: daysAgo(4, 10, 0),
    username: 'ombor',
    userFullName: 'Ombor mudiri',
    action: 'transferred',
    productCode: 'XM-303',
    productName: "Po'lat list (3mm)",
    category: 'xomashyo',
    quantity: 200,
    fromWarehouse: 'Ombor-2',
    toWarehouse: 'Ombor-3',
  },
  {
    timestamp: daysAgo(4, 16, 45),
    username: 'admin',
    userFullName: 'Administrator',
    action: 'sold',
    productCode: 'TM-102',
    productName: 'Markazdan qochma nasos SM 100-65-200',
    category: 'tayyor',
    quantity: 2,
  },
  {
    timestamp: daysAgo(3, 9, 30),
    username: 'ishchi',
    userFullName: 'Ishlab chiqarish ishchisi',
    action: 'added',
    productCode: 'YT-205',
    productName: "Stator o'ramlari (sinovdan o'tmagan)",
    category: 'yarim',
    quantity: 38,
  },
  {
    timestamp: daysAgo(3, 13, 10),
    username: 'ombor',
    userFullName: 'Ombor mudiri',
    action: 'sold',
    productCode: 'XM-305',
    productName: 'Podshipnik 6205',
    category: 'xomashyo',
    quantity: 120,
  },
  {
    timestamp: daysAgo(2, 8, 50),
    username: 'admin',
    userFullName: 'Administrator',
    action: 'deleted',
    productCode: 'TM-107',
    productName: "Eskirgan model — nasos JN-40",
    category: 'tayyor',
  },
  {
    timestamp: daysAgo(2, 15, 5),
    username: 'ombor',
    userFullName: 'Ombor mudiri',
    action: 'transferred',
    productCode: 'TM-106',
    productName: 'Drenaj nasosi GNOM 25-20',
    category: 'tayyor',
    quantity: 5,
    fromWarehouse: 'Ombor-1',
    toWarehouse: 'Ombor-2',
  },
  {
    timestamp: daysAgo(1, 10, 25),
    username: 'ishchi',
    userFullName: 'Ishlab chiqarish ishchisi',
    action: 'updated',
    productCode: 'YT-201',
    productName: "Dvigatel korpusi (yig'ilmagan)",
    category: 'yarim',
  },
  {
    timestamp: daysAgo(1, 17, 40),
    username: 'admin',
    userFullName: 'Administrator',
    action: 'sold',
    productCode: 'TM-104',
    productName: 'Suv nasosi CNS 60-99',
    category: 'tayyor',
    quantity: 1,
  },
  {
    timestamp: daysAgo(0, 9, 5),
    username: 'ombor',
    userFullName: 'Ombor mudiri',
    action: 'added',
    productCode: 'XM-306',
    productName: 'Alyuminiy quyma qorishma',
    category: 'xomashyo',
    quantity: 150,
  },
  {
    timestamp: daysAgo(0, 11, 30),
    username: 'admin',
    userFullName: 'Administrator',
    action: 'sold',
    productCode: 'TM-103',
    productName: 'Reduktor RCH-100',
    category: 'tayyor',
    quantity: 3,
  },
  {
    timestamp: daysAgo(6, 12, 40),
    username: 'sardor',
    userFullName: "Sardor To'rayev",
    action: 'added',
    productCode: 'TM-107',
    productName: 'Elektr dvigateli 5A 132M4',
    category: 'tayyor',
    quantity: 19,
  },
  {
    timestamp: daysAgo(5, 9, 50),
    username: 'gulnora',
    userFullName: 'Gulnora Rashidova',
    action: 'added',
    productCode: 'YT-208',
    productName: "Ventilyator qanotlari yig'indisi",
    category: 'yarim',
    quantity: 8,
  },
  {
    timestamp: daysAgo(3, 16, 15),
    username: 'dilnoza',
    userFullName: 'Dilnoza Yusupova',
    action: 'sold',
    productCode: 'TM-111',
    productName: 'Kompressor motori KM-2.2',
    category: 'tayyor',
    quantity: 5,
  },
  {
    timestamp: daysAgo(1, 14, 5),
    username: 'sardor',
    userFullName: "Sardor To'rayev",
    action: 'transferred',
    productCode: 'XM-308',
    productName: 'Payvandlash simi (Sv-08)',
    category: 'xomashyo',
    quantity: 80,
    fromWarehouse: 'Ombor-4',
    toWarehouse: 'Ombor-2',
  },
]

export const useActivityLogStore = defineStore('activityLog', () => {
  const entries = ref<LogEntry[]>(loadPersisted('activityLog', seed.map((e) => ({ ...e, id: id() }))))
  nextId = computeNextId(entries.value, 'L')
  persist('activityLog', entries)

  function record(payload: Omit<LogEntry, 'id' | 'timestamp'>) {
    entries.value.unshift({
      ...payload,
      id: id(),
      timestamp: new Date().toISOString(),
    })
  }

  const sorted = computed(() => [...entries.value].sort((a, b) => b.timestamp.localeCompare(a.timestamp)))

  return { entries, record, sorted }
})
