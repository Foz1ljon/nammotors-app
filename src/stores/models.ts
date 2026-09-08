import { ref } from 'vue'
import { defineStore } from 'pinia'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

export interface ProductModel {
  id: string
  name: string
}

let nextId = 1
function id() {
  return `MD${String(nextId++).padStart(3, '0')}`
}

const seedNames = ['AIR', 'SM', 'RCH', 'CNS', 'GNOM', '4A', 'ADM', '5A', 'BM', 'K', 'KM', 'VVN']

export const useModelsStore = defineStore('models', () => {
  const items = ref<ProductModel[]>(
    loadPersisted('models', seedNames.map((name) => ({ id: id(), name }))),
  )
  nextId = computeNextId(items.value, 'MD')
  persist('models', items)

  function addModel(name: string): ProductModel {
    const trimmed = name.trim()
    const existing = items.value.find((m) => m.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) return existing
    const model: ProductModel = { id: id(), name: trimmed }
    items.value.push(model)
    return model
  }

  function updateModel(mid: string, name: string) {
    const item = items.value.find((m) => m.id === mid)
    if (item) item.name = name.trim()
  }

  function removeModel(mid: string) {
    items.value = items.value.filter((m) => m.id !== mid)
  }

  return { items, addModel, updateModel, removeModel }
})
