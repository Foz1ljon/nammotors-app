import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

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

// supplierId values match the demo suppliers seeded in stores/suppliers.ts (S001..S004)
const seed: Omit<SupplierProduct, 'id'>[] = [
  { supplierId: 'S001', name: "Cho'yan quyma zagotovka", unit: 'kg', price: 14200, quantity: 5000, updatedAt: '2026-09-05' },
  { supplierId: 'S001', name: 'Mis simi (obmotka uchun)', unit: 'kg', price: 96500, quantity: 800, updatedAt: '2026-09-06' },
  { supplierId: 'S001', name: 'Podshipnik 6205', unit: 'dona', price: 23500, quantity: 1200, updatedAt: '2026-09-04' },
  { supplierId: 'S002', name: "Po'lat list (3mm)", unit: 'kg', price: 12500, quantity: 3000, updatedAt: '2026-09-03' },
  { supplierId: 'S002', name: 'Elektrotexnik poʻlat (stator uchun)', unit: 'kg', price: 20500, quantity: 600, updatedAt: '2026-09-06' },
  { supplierId: 'S002', name: "Po'lat truba (dyuym 2)", unit: 'm', price: 45000, quantity: 400, updatedAt: '2026-08-29' },
  { supplierId: 'S003', name: 'Izolyatsion lak', unit: 'litr', price: 66000, quantity: 250, updatedAt: '2026-09-02' },
  { supplierId: 'S003', name: 'Emallangan mis sim (0.5mm)', unit: 'kg', price: 102000, quantity: 350, updatedAt: '2026-09-05' },
  { supplierId: 'S003', name: 'Kabel kanal (PVX)', unit: 'm', price: 8600, quantity: 900, updatedAt: '2026-09-01' },
  { supplierId: 'S004', name: 'Alyuminiy quyma qorishma', unit: 'kg', price: 31000, quantity: 700, updatedAt: '2026-09-04' },
  { supplierId: 'S004', name: 'Bronza vtulka zagotovkasi', unit: 'dona', price: 54000, quantity: 0, updatedAt: '2026-08-20' },
]

export const useSupplierProductsStore = defineStore('supplierProducts', () => {
  const items = ref<SupplierProduct[]>(loadPersisted('supplierProducts', seed.map((p) => ({ ...p, id: id() }))))
  nextId = computeNextId(items.value, 'SP')
  persist('supplierProducts', items)

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
