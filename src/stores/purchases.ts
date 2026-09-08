import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

export interface Purchase {
  id: string
  timestamp: string
  supplierId: string
  supplierName: string
  supplierProductId: string
  productName: string
  unit: string
  price: number
  quantity: number
  total: number
  employeeUsername: string
  employeeFullName: string
}

let nextId = 1
function id() {
  return `PU${String(nextId++).padStart(5, '0')}`
}

function daysAgo(days: number, hour: number, minute: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// supplierProductId values match the demo catalog seeded in stores/supplierProducts.ts
const seed: Omit<Purchase, 'id'>[] = [
  {
    timestamp: daysAgo(6, 10, 20),
    supplierId: 'S001',
    supplierName: "Metallurg Ta'minot MChJ",
    supplierProductId: 'SP0001',
    productName: "Cho'yan quyma zagotovka",
    unit: 'kg',
    price: 14200,
    quantity: 500,
    total: 7100000,
    employeeUsername: 'admin',
    employeeFullName: 'Administrator',
  },
  {
    timestamp: daysAgo(4, 13, 45),
    supplierId: 'S002',
    supplierName: "Po'lat Tex Servis MChJ",
    supplierProductId: 'SP0004',
    productName: "Po'lat list (3mm)",
    unit: 'kg',
    price: 12500,
    quantity: 300,
    total: 3750000,
    employeeUsername: 'ombor',
    employeeFullName: 'Ombor mudiri',
  },
  {
    timestamp: daysAgo(2, 9, 10),
    supplierId: 'S003',
    supplierName: 'ElektroSim Taʼminot',
    supplierProductId: 'SP0007',
    productName: 'Izolyatsion lak',
    unit: 'litr',
    price: 66000,
    quantity: 40,
    total: 2640000,
    employeeUsername: 'admin',
    employeeFullName: 'Administrator',
  },
]

export const usePurchasesStore = defineStore('purchases', () => {
  const entries = ref<Purchase[]>(loadPersisted('purchases', seed.map((p) => ({ ...p, id: id() }))))
  nextId = computeNextId(entries.value, 'PU')
  persist('purchases', entries)

  function record(payload: Omit<Purchase, 'id' | 'timestamp'>) {
    entries.value.unshift({
      ...payload,
      id: id(),
      timestamp: new Date().toISOString(),
    })
  }

  const sorted = computed(() => [...entries.value].sort((a, b) => b.timestamp.localeCompare(a.timestamp)))

  function bySupplier(supplierId: string) {
    return computed(() => sorted.value.filter((p) => p.supplierId === supplierId))
  }

  return { entries, record, sorted, bySupplier }
})
