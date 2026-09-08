import { ref } from 'vue'
import { defineStore } from 'pinia'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

export interface Customer {
  id: string
  name: string
  contactPerson: string
  phone: string
  address: string
  debt: number
  notes: string
}

let nextId = 1
function id() {
  return `C${String(nextId++).padStart(3, '0')}`
}

const seed: Omit<Customer, 'id'>[] = [
  {
    name: "Namangan Suv Ta'minoti MChJ",
    contactPerson: 'Otabek Rahimov',
    phone: '+998 90 111 22 33',
    address: 'Namangan sh., Uychi ko\'chasi 14',
    debt: 4850000,
    notes: 'Har oy nasos ehtiyot qismlari xarid qiladi',
  },
  {
    name: 'Paxta Tozalash Zavodi',
    contactPerson: 'Bahodir Yusupov',
    phone: '+998 91 222 33 44',
    address: 'Namangan viloyati, Uychi tumani',
    debt: 0,
    notes: '',
  },
  {
    name: 'Temir Yo\'l Deposi',
    contactPerson: 'Farrux Nabiyev',
    phone: '+998 93 333 44 55',
    address: 'Namangan sh., Depo ko\'chasi 2',
    debt: 12300000,
    notes: 'Yirik buyurtmalar — 30 kunlik nasiya shartnomasi',
  },
  {
    name: 'Bioelektro MChJ',
    contactPerson: 'Shahzod Qodirov',
    phone: '+998 97 444 55 66',
    address: "Toshkent sh., Yunusobod tumani",
    debt: 0,
    notes: '',
  },
  {
    name: "Shoxrux (jismoniy shaxs)",
    contactPerson: '',
    phone: '+998 99 555 66 77',
    address: '',
    debt: 320000,
    notes: 'Chakana xaridor',
  },
]

export const useCustomersStore = defineStore('customers', () => {
  const items = ref<Customer[]>(loadPersisted('customers', seed.map((c) => ({ ...c, id: id() }))))
  nextId = computeNextId(items.value, 'C')
  persist('customers', items)

  function addCustomer(payload: Omit<Customer, 'id'>) {
    items.value.unshift({ ...payload, id: id() })
  }

  function updateCustomer(cid: string, payload: Partial<Omit<Customer, 'id'>>) {
    const idx = items.value.findIndex((c) => c.id === cid)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...payload } as Customer
    }
  }

  function removeCustomer(cid: string) {
    items.value = items.value.filter((c) => c.id !== cid)
  }

  function adjustDebt(cid: string, delta: number) {
    const item = items.value.find((c) => c.id === cid)
    if (item) item.debt = Math.max(0, item.debt + delta)
  }

  return { items, addCustomer, updateCustomer, removeCustomer, adjustDebt }
})
