import { ref } from 'vue'
import { defineStore } from 'pinia'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

export type RepairStatus = 'qabul' | 'jarayonda' | 'tayyor' | 'topshirildi'

// Values are i18n message keys (see src/i18n/locales) — resolve with t() at the call site.
export const repairStatusMeta: Record<RepairStatus, { label: string; color: string }> = {
  qabul: { label: 'repairs.statusQabul', color: 'default' },
  jarayonda: { label: 'repairs.statusJarayonda', color: 'processing' },
  tayyor: { label: 'repairs.statusTayyor', color: 'success' },
  topshirildi: { label: 'repairs.statusTopshirildi', color: 'blue' },
}

export const REPAIR_STATUSES = Object.keys(repairStatusMeta) as RepairStatus[]

export interface RepairOrder {
  id: string
  receivedAt: string
  customerName: string
  customerPhone: string
  equipmentName: string
  problem: string
  status: RepairStatus
  price: number
  note: string
}

let nextId = 1
function id() {
  return `R${String(nextId++).padStart(4, '0')}`
}

function daysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

const seed: Omit<RepairOrder, 'id'>[] = [
  {
    receivedAt: daysAgo(6),
    customerName: 'Temir Yo\'l Deposi',
    customerPhone: '+998 93 333 44 55',
    equipmentName: 'Elektr dvigateli AIR 132S4',
    problem: "Obmotka kuygan, podshipniklar shovqin qilyapti",
    status: 'topshirildi',
    price: 780000,
    note: '',
  },
  {
    receivedAt: daysAgo(4),
    customerName: "Namangan Suv Ta'minoti MChJ",
    customerPhone: '+998 90 111 22 33',
    equipmentName: 'Markazdan qochma nasos SM 100-65-200',
    problem: "Val egilgan, ishchi g'ildirak yeyilgan",
    status: 'tayyor',
    price: 1250000,
    note: 'Ehtiyot qismlar omborda mavjud edi',
  },
  {
    receivedAt: daysAgo(2),
    customerName: 'Shoxrux (jismoniy shaxs)',
    customerPhone: '+998 99 555 66 77',
    equipmentName: 'Drenaj nasosi GNOM 25-20',
    problem: 'Ishga tushmayapti, kondensator shubhali',
    status: 'jarayonda',
    price: 0,
    note: 'Diagnostika tugallanmagan',
  },
  {
    receivedAt: daysAgo(1),
    customerName: 'Bioelektro MChJ',
    customerPhone: '+998 97 444 55 66',
    equipmentName: 'Reduktor RCH-100',
    problem: "Yog' oqmoqda, tishli g'ildirak yeyilishi bor",
    status: 'qabul',
    price: 0,
    note: '',
  },
  {
    receivedAt: daysAgo(0),
    customerName: 'Paxta Tozalash Zavodi',
    customerPhone: '+998 91 222 33 44',
    equipmentName: 'Kompressor dvigateli 4A',
    problem: "Kuchlanish tushib ketganda o'chib qolyapti",
    status: 'qabul',
    price: 0,
    note: 'Shoshilinch buyurtma',
  },
]

export const useRepairsStore = defineStore('repairs', () => {
  const items = ref<RepairOrder[]>(loadPersisted('repairs', seed.map((r) => ({ ...r, id: id() }))))
  nextId = computeNextId(items.value, 'R')
  persist('repairs', items)

  function addRepair(payload: Omit<RepairOrder, 'id'>) {
    items.value.unshift({ ...payload, id: id() })
  }

  function updateRepair(rid: string, payload: Partial<Omit<RepairOrder, 'id'>>) {
    const idx = items.value.findIndex((r) => r.id === rid)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...payload } as RepairOrder
    }
  }

  function removeRepair(rid: string) {
    items.value = items.value.filter((r) => r.id !== rid)
  }

  return { items, addRepair, updateRepair, removeRepair }
})
