import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

export type ProductCategory = 'tayyor' | 'yarim' | 'xomashyo'

export interface Product {
  id: string
  code: string
  name: string
  image: string
  model: string
  kvt?: number
  rpm?: number
  category: ProductCategory
  unit: string
  quantity: number
  minStock: number
  price: number
  warehouse: string
  updatedAt: string
}

// Values are i18n message keys (see src/i18n/locales) — resolve with t() at the call site.
export const categoryMeta: Record<ProductCategory, { label: string; short: string }> = {
  tayyor: { label: 'category.tayyor', short: 'categoryShort.tayyor' },
  yarim: { label: 'category.yarim', short: 'categoryShort.yarim' },
  xomashyo: { label: 'category.xomashyo', short: 'categoryShort.xomashyo' },
}

let nextId = 1
function id() {
  return `P${String(nextId++).padStart(4, '0')}`
}

const seed: Omit<Product, 'id'>[] = [
  // Tayyor mahsulotlar
  { code: 'TM-101', name: 'Elektr dvigateli AIR 100S4', image: '', model: 'AIR', kvt: 5.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 42, minStock: 15, price: 2450000, warehouse: 'Ombor-1', updatedAt: '2026-09-05' },
  { code: 'TM-102', name: 'Markazdan qochma nasos SM 100-65-200', image: '', model: 'SM', kvt: 15, rpm: 2900, category: 'tayyor', unit: 'dona', quantity: 8, minStock: 10, price: 5180000, warehouse: 'Ombor-1', updatedAt: '2026-09-04' },
  { code: 'TM-103', name: 'Reduktor RCH-100', image: '', model: 'RCH', rpm: 1450, category: 'tayyor', unit: 'dona', quantity: 23, minStock: 8, price: 1870000, warehouse: 'Ombor-2', updatedAt: '2026-09-06' },
  { code: 'TM-104', name: 'Suv nasosi CNS 60-99', image: '', model: 'CNS', kvt: 22, rpm: 2950, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 5, price: 6420000, warehouse: 'Ombor-1', updatedAt: '2026-09-01' },
  { code: 'TM-105', name: 'Kompressor dvigateli 4A', image: '', model: '4A', kvt: 3, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 31, minStock: 12, price: 1650000, warehouse: 'Ombor-2', updatedAt: '2026-09-06' },
  { code: 'TM-106', name: 'Drenaj nasosi GNOM 25-20', image: '', model: 'GNOM', kvt: 1.5, rpm: 2900, category: 'tayyor', unit: 'dona', quantity: 17, minStock: 10, price: 980000, warehouse: 'Ombor-1', updatedAt: '2026-09-03' },

  // Yarim tayyor
  { code: 'YT-201', name: "Dvigatel korpusi (yig'ilmagan)", image: '', model: 'AIR', category: 'yarim', unit: 'dona', quantity: 64, minStock: 30, price: 620000, warehouse: 'Sex-3', updatedAt: '2026-09-06' },
  { code: 'YT-202', name: 'Rotor uzeli (mashinlangan)', image: '', model: 'AIR', rpm: 1500, category: 'yarim', unit: 'dona', quantity: 12, minStock: 20, price: 890000, warehouse: 'Sex-3', updatedAt: '2026-09-05' },
  { code: 'YT-203', name: "Nasos qopqog'i (qayta ishlangan)", image: '', model: 'SM', category: 'yarim', unit: 'dona', quantity: 55, minStock: 25, price: 310000, warehouse: 'Sex-2', updatedAt: '2026-09-02' },
  { code: 'YT-204', name: 'Val-shesternya zagotovkasi', image: '', model: 'RCH', category: 'yarim', unit: 'dona', quantity: 9, minStock: 15, price: 450000, warehouse: 'Sex-3', updatedAt: '2026-09-06' },
  { code: 'YT-205', name: "Stator o'ramlari (sinovdan o'tmagan)", image: '', model: 'AIR', rpm: 3000, category: 'yarim', unit: 'dona', quantity: 38, minStock: 20, price: 540000, warehouse: 'Sex-2', updatedAt: '2026-09-04' },

  // Xomashyo
  { code: 'XM-301', name: "Cho'yan quyma zagotovka", image: '', model: '', category: 'xomashyo', unit: 'kg', quantity: 3200, minStock: 1000, price: 14500, warehouse: 'Ombor-3', updatedAt: '2026-09-06' },
  { code: 'XM-302', name: 'Mis simi (obmotka uchun)', image: '', model: '', category: 'xomashyo', unit: 'kg', quantity: 180, minStock: 200, price: 98000, warehouse: 'Ombor-3', updatedAt: '2026-09-05' },
  { code: 'XM-303', name: 'Poʻlat list (3mm)', image: '', model: '', category: 'xomashyo', unit: 'kg', quantity: 950, minStock: 400, price: 12800, warehouse: 'Ombor-2', updatedAt: '2026-09-03' },
  { code: 'XM-304', name: 'Elektrotexnik poʻlat (stator uchun)', image: '', model: '', category: 'xomashyo', unit: 'kg', quantity: 60, minStock: 150, price: 21000, warehouse: 'Ombor-3', updatedAt: '2026-09-06' },
  { code: 'XM-305', name: 'Podshipnik 6205', image: '', model: '', category: 'xomashyo', unit: 'dona', quantity: 640, minStock: 200, price: 24000, warehouse: 'Ombor-2', updatedAt: '2026-09-01' },
  { code: 'XM-306', name: 'Alyuminiy quyma qorishma', image: '', model: '', category: 'xomashyo', unit: 'kg', quantity: 410, minStock: 150, price: 32500, warehouse: 'Ombor-3', updatedAt: '2026-09-04' },
  { code: 'XM-307', name: 'Izolyatsion lak', image: '', model: '', category: 'xomashyo', unit: 'litr', quantity: 0, minStock: 40, price: 68000, warehouse: 'Ombor-2', updatedAt: '2026-08-30' },
  { code: 'XM-308', name: 'Payvandlash simi (Sv-08)', image: '', model: '', category: 'xomashyo', unit: 'kg', quantity: 320, minStock: 100, price: 28000, warehouse: 'Ombor-4', updatedAt: '2026-09-07' },
  { code: 'XM-309', name: 'Emallangan mis sim (0.5mm)', image: '', model: '', category: 'xomashyo', unit: 'kg', quantity: 90, minStock: 120, price: 105000, warehouse: 'Ombor-3', updatedAt: '2026-09-06' },
  { code: 'XM-310', name: "Bo'yoq (kislotaga chidamli)", image: '', model: '', category: 'xomashyo', unit: 'litr', quantity: 55, minStock: 30, price: 84000, warehouse: 'Ombor-2', updatedAt: '2026-09-05' },
  { code: 'XM-311', name: "Rezina prokladka to'plami", image: '', model: '', category: 'xomashyo', unit: 'dona', quantity: 480, minStock: 150, price: 6500, warehouse: 'Ombor-4', updatedAt: '2026-09-07' },

  // Yana tayyor mahsulotlar
  { code: 'TM-107', name: 'Elektr dvigateli 5A 132M4', image: '', model: '5A', kvt: 11, rpm: 1460, category: 'tayyor', unit: 'dona', quantity: 19, minStock: 10, price: 3200000, warehouse: 'Ombor-1', updatedAt: '2026-09-07' },
  { code: 'TM-108', name: 'Nasos agregati K 100-65-200', image: '', model: 'K', kvt: 18.5, rpm: 2900, category: 'tayyor', unit: 'dona', quantity: 6, minStock: 8, price: 5850000, warehouse: 'Ombor-4', updatedAt: '2026-09-06' },
  { code: 'TM-109', name: 'Ventilyator VVN-5', image: '', model: 'VVN', kvt: 7.5, rpm: 1450, category: 'tayyor', unit: 'dona', quantity: 14, minStock: 6, price: 2100000, warehouse: 'Filial-1', updatedAt: '2026-09-05' },
  { code: 'TM-110', name: 'Reduktor BM-50', image: '', model: 'BM', rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 27, minStock: 10, price: 1420000, warehouse: 'Ombor-2', updatedAt: '2026-09-07' },
  { code: 'TM-111', name: 'Kompressor motori KM-2.2', image: '', model: 'KM', kvt: 2.2, rpm: 2850, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 8, price: 890000, warehouse: 'Ombor-3', updatedAt: '2026-09-04' },

  // Yana yarim tayyor
  { code: 'YT-206', name: 'Val zagotovkasi (tokarlik)', image: '', model: '5A', category: 'yarim', unit: 'dona', quantity: 22, minStock: 15, price: 380000, warehouse: 'Sex-1', updatedAt: '2026-09-06' },
  { code: 'YT-207', name: "Podshipnik uyasi (payvandlangan)", image: '', model: 'K', category: 'yarim', unit: 'dona', quantity: 40, minStock: 20, price: 210000, warehouse: 'Sex-2', updatedAt: '2026-09-05' },
  { code: 'YT-208', name: "Ventilyator qanotlari yig'indisi", image: '', model: 'VVN', category: 'yarim', unit: 'dona', quantity: 8, minStock: 12, price: 260000, warehouse: 'Sex-1', updatedAt: '2026-09-07' },
  { code: 'YT-209', name: "Korpus qopqog'i (bo'yalmagan)", image: '', model: 'BM', category: 'yarim', unit: 'dona', quantity: 33, minStock: 18, price: 175000, warehouse: 'Sex-3', updatedAt: '2026-09-04' },
]

export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>(loadPersisted('products', seed.map((p) => ({ ...p, id: id() }))))
  nextId = computeNextId(items.value, 'P')
  persist('products', items)

  function byCategory(category: ProductCategory) {
    return computed(() => items.value.filter((p) => p.category === category))
  }

  function statusOf(p: Product): 'tugagan' | 'kam' | 'yetarli' {
    if (p.quantity <= 0) return 'tugagan'
    if (p.quantity <= p.minStock) return 'kam'
    return 'yetarli'
  }

  function addProduct(payload: Omit<Product, 'id' | 'updatedAt'>) {
    items.value.unshift({
      ...payload,
      id: id(),
      updatedAt: new Date().toISOString().slice(0, 10),
    })
  }

  function updateProduct(pid: string, payload: Partial<Omit<Product, 'id'>>) {
    const idx = items.value.findIndex((p) => p.id === pid)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...payload, updatedAt: new Date().toISOString().slice(0, 10) } as Product
    }
  }

  function removeProduct(pid: string) {
    items.value = items.value.filter((p) => p.id !== pid)
  }

  const totals = computed(() => {
    const byCat = (c: ProductCategory) => items.value.filter((p) => p.category === c)
    const sumValue = (arr: Product[]) => arr.reduce((s, p) => s + p.quantity * p.price, 0)
    const lowCount = (arr: Product[]) => arr.filter((p) => statusOf(p) !== 'yetarli').length
    return {
      tayyor: { count: byCat('tayyor').length, value: sumValue(byCat('tayyor')), low: lowCount(byCat('tayyor')) },
      yarim: { count: byCat('yarim').length, value: sumValue(byCat('yarim')), low: lowCount(byCat('yarim')) },
      xomashyo: { count: byCat('xomashyo').length, value: sumValue(byCat('xomashyo')), low: lowCount(byCat('xomashyo')) },
      all: { count: items.value.length, value: sumValue(items.value), low: lowCount(items.value) },
    }
  })

  return { items, byCategory, statusOf, addProduct, updateProduct, removeProduct, totals }
})
