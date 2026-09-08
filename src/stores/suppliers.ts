import { ref } from 'vue'
import { defineStore } from 'pinia'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

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
    username: 'metallurg@ta-minot.uz',
    password: 'metall123',
    companyName: "Metallurg Ta'minot MChJ",
    contactPerson: 'Aziz Karimov',
    phone: '+998 90 123 45 67',
    active: true,
  },
  {
    username: 'poltex@poltex-servis.uz',
    password: 'poltex123',
    companyName: "Po'lat Tex Servis MChJ",
    contactPerson: 'Bekzod Yoldoshev',
    phone: '+998 91 234 56 78',
    active: true,
  },
  {
    username: 'elektrosim@elektrosim.uz',
    password: 'elektro123',
    companyName: "ElektroSim Ta'minot",
    contactPerson: 'Malika Nazarova',
    phone: '+998 93 345 67 89',
    active: true,
  },
  {
    username: 'alyumkuyma@alyumkuyma.uz',
    password: 'alyum123',
    companyName: "Alyumkuyma Ishlab Chiqarish",
    contactPerson: "G'olib Sharipov",
    phone: '+998 97 456 78 90',
    active: false,
  },
]

export const useSuppliersStore = defineStore('suppliers', () => {
  const items = ref<Supplier[]>(loadPersisted('suppliers', seed.map((s) => ({ ...s, id: id() }))))
  nextId = computeNextId(items.value, 'S')
  persist('suppliers', items)

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
