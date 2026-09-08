import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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

export const usePurchasesStore = defineStore('purchases', () => {
  const entries = ref<Purchase[]>([])

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
