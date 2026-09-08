import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Warehouse {
  id: string
  name: string
}

let nextId = 1
function id() {
  return `WH${String(nextId++).padStart(3, '0')}`
}

const seedNames = ['Ombor-1', 'Ombor-2', 'Ombor-3', 'Sex-2', 'Sex-3']

export const useWarehousesStore = defineStore('warehouses', () => {
  const items = ref<Warehouse[]>(seedNames.map((name) => ({ id: id(), name })))

  function addWarehouse(name: string): Warehouse {
    const trimmed = name.trim()
    const existing = items.value.find((w) => w.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) return existing
    const warehouse: Warehouse = { id: id(), name: trimmed }
    items.value.push(warehouse)
    return warehouse
  }

  function updateWarehouse(wid: string, name: string) {
    const item = items.value.find((w) => w.id === wid)
    if (item) item.name = name.trim()
  }

  function removeWarehouse(wid: string) {
    items.value = items.value.filter((w) => w.id !== wid)
  }

  return { items, addWarehouse, updateWarehouse, removeWarehouse }
})
