import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface SupplierProduct {
  id: string
  supplierId: string
  name: string
  unit: string
  price: number
  quantity: number
  updatedAt: string
}

let nextId = 1
function id() {
  return `SP${String(nextId++).padStart(4, '0')}`
}

// supplierId 'S001' matches the first demo supplier seeded in stores/suppliers.ts
const seed: Omit<SupplierProduct, 'id'>[] = [
  { supplierId: 'S001', name: "Cho'yan quyma zagotovka", unit: 'kg', price: 14200, quantity: 5000, updatedAt: '2026-09-05' },
  { supplierId: 'S001', name: 'Mis simi (obmotka uchun)', unit: 'kg', price: 96500, quantity: 800, updatedAt: '2026-09-06' },
]

export const useSupplierProductsStore = defineStore('supplierProducts', () => {
  const items = ref<SupplierProduct[]>(seed.map((p) => ({ ...p, id: id() })))

  function bySupplier(supplierId: string) {
    return computed(() => items.value.filter((p) => p.supplierId === supplierId))
  }

  function addProduct(payload: Omit<SupplierProduct, 'id' | 'updatedAt'>) {
    items.value.unshift({
      ...payload,
      id: id(),
      updatedAt: new Date().toISOString().slice(0, 10),
    })
  }

  function updateProduct(pid: string, payload: Partial<Omit<SupplierProduct, 'id' | 'supplierId'>>) {
    const idx = items.value.findIndex((p) => p.id === pid)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...payload, updatedAt: new Date().toISOString().slice(0, 10) } as SupplierProduct
    }
  }

  function removeProduct(pid: string) {
    items.value = items.value.filter((p) => p.id !== pid)
  }

  return { items, bySupplier, addProduct, updateProduct, removeProduct }
})
