import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Supplier {
  id: string
  username: string
  password: string
  companyName: string
  contactPerson: string
  phone: string
  active: boolean
}

let nextId = 1
function id() {
  return `S${String(nextId++).padStart(3, '0')}`
}

const seed: Omit<Supplier, 'id'>[] = [
  {
    username: 'metallurg',
    password: 'metall123',
    companyName: "Metallurg Ta'minot MChJ",
    contactPerson: 'Aziz Karimov',
    phone: '+998 90 123 45 67',
    active: true,
  },
]

export const useSuppliersStore = defineStore('suppliers', () => {
  const items = ref<Supplier[]>(seed.map((s) => ({ ...s, id: id() })))

  function findByCredentials(username: string, password: string) {
    const uname = username.trim().toLowerCase()
    return items.value.find((s) => s.active && s.username.toLowerCase() === uname && s.password === password)
  }

  function findByUsername(username: string) {
    const uname = username.trim().toLowerCase()
    return items.value.find((s) => s.username.toLowerCase() === uname)
  }

  function findById(sid: string) {
    return items.value.find((s) => s.id === sid)
  }

  function addSupplier(payload: Omit<Supplier, 'id'>) {
    items.value.unshift({ ...payload, id: id() })
  }

  function updateSupplier(sid: string, payload: Partial<Omit<Supplier, 'id'>>) {
    const idx = items.value.findIndex((s) => s.id === sid)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...payload } as Supplier
    }
  }

  function removeSupplier(sid: string) {
    items.value = items.value.filter((s) => s.id !== sid)
  }

  return { items, findByCredentials, findByUsername, findById, addSupplier, updateSupplier, removeSupplier }
})
