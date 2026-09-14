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
  // Astatka sklad — Elektrodvigatellar (29.06.2026)
  { code: 'ED-001', name: 'АИР63А4 (YS63-4 кег мар)', image: '', model: 'АИР', kvt: 0.25, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-002', name: 'АИР63А4', image: '', model: 'АИР', kvt: 0.25, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-003', name: 'АИР71В4 (YS713-4 кег мар)', image: '', model: 'АИР', kvt: 0.75, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-004', name: 'АИР71A6', image: '', model: 'АИР', kvt: 0.37, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 33, minStock: 5, price: 1050000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-005', name: 'АИР63A2', image: '', model: 'АИР', kvt: 0.37, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 48, minStock: 7, price: 720000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-006', name: 'АИР63В4', image: '', model: 'АИР', kvt: 0.37, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 18, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-007', name: 'YE3-7124-B35', image: '', model: 'YE', kvt: 0.37, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 84, minStock: 13, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-008', name: 'АИР63B2', image: '', model: 'АИР', kvt: 0.55, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 123, minStock: 18, price: 860000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-009', name: 'АИР71A4', image: '', model: 'АИР', kvt: 0.55, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 21, minStock: 3, price: 1050000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-010', name: 'АИР80MA6', image: '', model: 'АИР', kvt: 0.75, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 38, minStock: 6, price: 1460000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-011', name: 'АИР71В4', image: '', model: 'АИР', kvt: 0.75, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-012', name: 'АИР71A2', image: '', model: 'АИР', kvt: 0.75, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 20, minStock: 3, price: 1220000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-013', name: 'АИР71B2', image: '', model: 'АИР', kvt: 1.1, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 68, minStock: 10, price: 1330000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-014', name: 'АИР80B6', image: '', model: 'АИР', kvt: 1.1, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 47, minStock: 7, price: 1780000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-015', name: 'АИР80MA2', image: '', model: 'АИР', kvt: 1.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 1470000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-016', name: 'АИР90L6', image: '', model: 'АИР', kvt: 1.5, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 47, minStock: 7, price: 1950000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-017', name: 'АИР80МА2 FL', image: '', model: 'АИР', kvt: 1.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-018', name: '3-YE3-80M2-6B/35', image: '', model: 'YE', kvt: 0.55, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 1220000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-019', name: '3-YE3-90S-4/B35', image: '', model: 'YE', kvt: 1.1, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 1460000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-020', name: 'АИР80А4 FL', image: '', model: 'АИР', kvt: 1.1, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-021', name: 'АИР100L6 FL', image: '', model: 'АИР', kvt: 2.2, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 2800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-022', name: 'АИР100L6', image: '', model: 'АИР', kvt: 2.2, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 64, minStock: 10, price: 2800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-023', name: 'АИР112МА6', image: '', model: 'АИР', kvt: 3, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 79, minStock: 12, price: 3270000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-024', name: 'АИР100S4 FL', image: '', model: 'АИР', kvt: 3, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 15, minStock: 3, price: 2920000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-025', name: 'АИР112МА6 FL', image: '', model: 'АИР', kvt: 3, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 3270000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-026', name: 'АИР100S4', image: '', model: 'АИР', kvt: 3, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 37, minStock: 6, price: 2920000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-027', name: 'АИР112MB8', image: '', model: 'АИР', kvt: 3, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 4150000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-028', name: 'АИР112MB6 FL', image: '', model: 'АИР', kvt: 4, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 12, minStock: 3, price: 3760000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-029', name: 'АИР100L4', image: '', model: 'АИР', kvt: 4, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 55, minStock: 8, price: 3240000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-030', name: 'АИР100L4 FL', image: '', model: 'АИР', kvt: 4, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 3240000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-031', name: 'АИР112МВ6', image: '', model: 'АИР', kvt: 4, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 31, minStock: 5, price: 3760000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-032', name: 'АИР100S2', image: '', model: 'АИР', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 2950000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-033', name: 'АИР132S6', image: '', model: 'АИР', kvt: 5.5, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 54, minStock: 8, price: 4440000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-034', name: 'АИР112M4', image: '', model: 'АИР', kvt: 5.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 37, minStock: 6, price: 3850000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-035', name: 'АИР112M4 FL', image: '', model: 'АИР', kvt: 5.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 3850000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-036', name: 'АИР100L2', image: '', model: 'АИР', kvt: 5.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 3380000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-037', name: 'АИР100L2 FL', image: '', model: 'АИР', kvt: 5.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-038', name: 'АИР112M2', image: '', model: 'АИР', kvt: 7.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 3600000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-039', name: 'АИР132S4', image: '', model: 'АИР', kvt: 7.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 4360000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-040', name: 'АИР160S8', image: '', model: 'АИР', kvt: 7.5, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 8850000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-041', name: 'АИР132М6', image: '', model: 'АИР', kvt: 7.5, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 4950000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-042', name: 'АИР132М6 FL', image: '', model: 'АИР', kvt: 7.5, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 23, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-043', name: 'АИР160S6', image: '', model: 'АИР', kvt: 11, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 8800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-044', name: 'АИР132M4', image: '', model: 'АИР', kvt: 11, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 4950000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-045', name: 'АИР132M2', image: '', model: 'АИР', kvt: 11, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-046', name: 'АИР160M6', image: '', model: 'АИР', kvt: 15, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 10300000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-047', name: 'АИР160S4 FL', image: '', model: 'АИР', kvt: 15, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 8900000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-048', name: 'АИР200M8', image: '', model: 'АИР', kvt: 18.5, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 5, minStock: 2, price: 15940000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-049', name: 'АИР160M2', image: '', model: 'АИР', kvt: 18.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 15, minStock: 3, price: 9120000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-050', name: 'АИР200М6', image: '', model: 'АИР', kvt: 22, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 15440000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-051', name: 'АИР180S4', image: '', model: 'АИР', kvt: 22, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 7, minStock: 3, price: 13900000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-052', name: 'АИР180S4 FL', image: '', model: 'АИР', kvt: 22, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 13900000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-053', name: 'АИР180S2', image: '', model: 'АИР', kvt: 22, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-054', name: 'АИР180M4', image: '', model: 'АИР', kvt: 30, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 29, minStock: 4, price: 14800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-055', name: 'АИР280M8', image: '', model: 'АИР', kvt: 75, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 38800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-056', name: 'АИР200L6', image: '', model: 'АИР', kvt: 30, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 17100000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-057', name: 'АИР225M8', image: '', model: 'АИР', kvt: 30, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 21830000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-058', name: 'АИР180M2', image: '', model: 'АИР', kvt: 30, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 5, minStock: 2, price: 13900000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-059', name: 'АИР180M4 FL', image: '', model: 'АИР', kvt: 30, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 14800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-060', name: 'ВАИР225M8', image: '', model: 'ВАИР', kvt: 30, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 21830000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-061', name: 'АИР225M6', image: '', model: 'АИР', kvt: 37, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 19100000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-062', name: 'АИР200M4', image: '', model: 'АИР', kvt: 37, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 8, minStock: 3, price: 17800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-063', name: 'АИР250S8 (YE3-280S-8 кег)', image: '', model: 'АИР', kvt: 37, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 64, minStock: 10, price: 28900000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-064', name: 'АИР200L2', image: '', model: 'АИР', kvt: 45, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 16700000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-065', name: 'АИР200L4', image: '', model: 'АИР', kvt: 45, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 18200000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-066', name: 'АИР225М2', image: '', model: 'АИР', kvt: 55, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-067', name: 'АИР225S4 (АИР225М4)', image: '', model: 'АИР', kvt: 55, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-068', name: 'АИР250M6', image: '', model: 'АИР', kvt: 55, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 29800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-069', name: 'YE3-315М-10', image: '', model: 'YE', kvt: 55, rpm: 600, category: 'tayyor', unit: 'dona', quantity: 8, minStock: 3, price: 45000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-070', name: 'АИР280S6', image: '', model: 'АИР', kvt: 75, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 33600000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-071', name: 'АИР250M4', image: '', model: 'АИР', kvt: 90, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 33800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-072', name: 'YBX4-280M-4 FL', image: '', model: 'YBX', kvt: 90, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 33800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-073', name: 'YE4-315S-4', image: '', model: 'YE', kvt: 110, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-074', name: 'АИР355S8', image: '', model: 'АИР', kvt: 132, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 115000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-075', name: 'АИР315M4', image: '', model: 'АИР', kvt: 132, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 48960000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-076', name: 'YRKK400-4', image: '', model: 'YRKK', kvt: 315, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 139800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-077', name: 'A4-500-12У3', image: '', model: 'A', kvt: 315, rpm: 500, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 378000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-078', name: 'А4-400Х-4У3', image: '', model: 'А', kvt: 400, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-079', name: 'А4-450Y-6У3', image: '', model: 'А', kvt: 500, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 397000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-080', name: 'А4-450Y-8У3', image: '', model: 'А', kvt: 500, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-081', name: 'А4-400Х-4У3', image: '', model: 'А', kvt: 500, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-082', name: 'А4-400Х-4У3', image: '', model: 'А', kvt: 630, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-083', name: 'МЗВР400LC', image: '', model: 'МЗВР', kvt: 710, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 1848000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-084', name: 'А4-500-6У3', image: '', model: 'А', kvt: 710, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-085', name: 'СД(Т)1000-6', image: '', model: 'СД', kvt: 1000, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 1078000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-086', name: 'АИР90L4', image: '', model: 'АИР', kvt: 2.2, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 5, minStock: 2, price: 1900000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-087', name: 'АИР132S4 FL', image: '', model: 'АИР', kvt: 7.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 4360000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-088', name: 'СД(М)-1600-6 (СД(ТМ)-1600-6 кег мар)', image: '', model: 'СД', kvt: 1600, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-089', name: 'СД(ТМ)-1600-8', image: '', model: 'СД', kvt: 1600, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'ED-090', name: 'Дизел мотор', image: '', model: 'Дизел', kvt: 22, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 6500000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },

  // Astatka sklad — Suv nasoslari (29.06.2026)
  { code: 'SN-001', name: 'СМ100-65-200', image: '', model: 'СМ', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 15000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-002', name: 'ГРАТ170/40', image: '', model: 'ГРАТ', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 85000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-003', name: 'ГРАТ400-20(150ZJA-A55)', image: '', model: 'ГРАТ', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 120000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-004', name: 'К500-500', image: '', model: 'К', category: 'tayyor', unit: 'dona', quantity: 13, minStock: 3, price: 25000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-005', name: '300Д90', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-006', name: '200Д90', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-007', name: '200Д90', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-008', name: 'NSLOW250-600 кег Д1250-125', image: '', model: 'NSLOW', category: 'tayyor', unit: 'dona', quantity: 7, minStock: 3, price: 94000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-009', name: 'Д315-71', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 11, minStock: 3, price: 36000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-010', name: 'К65-160', image: '', model: 'К', category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-011', name: 'NSLOW500-860 4200/95', image: '', model: 'NSLOW', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-012', name: 'Д4000-95-2 (NSLOW500-860) (1600 kVt, 1000 ob/min)', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-013', name: 'КА40-25-160 (IH40-25-160 кег мар)', image: '', model: 'КА', category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-014', name: 'АХ100-65-315', image: '', model: 'АХ', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-015', name: 'АХ80-50-315', image: '', model: 'АХ', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-016', name: 'К300', image: '', model: 'К', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-017', name: 'GD400-20-50кв', image: '', model: 'GD', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-018', name: 'NSLOW250-510-4 кег Д2500-62', image: '', model: 'NSLOW', category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-019', name: 'NSLOW125-365 кег Д320-95', image: '', model: 'NSLOW', category: 'tayyor', unit: 'dona', quantity: 20, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-020', name: 'Д1600-90 (NSLOW250-560-4дан) (560 kVt, 1600 ob/min)', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 5, minStock: 2, price: 87000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-021', name: 'Д2000-1000 NSLOW350-640-4дан (800 kVt, 1500 ob/min)', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-022', name: 'Д6300-80 NSLOW800-846-6дан (1800 kVt, 1000 ob/min)', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-023', name: 'Д5000-27 NSLOW900-690-8дан (500 kVt, 750 ob/min)', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-024', name: 'Д500-63', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-025', name: 'YSB40-0.6', image: '', model: 'YSB', category: 'tayyor', unit: 'dona', quantity: 12, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-026', name: 'YSB20-0.6', image: '', model: 'YSB', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-027', name: 'К400', image: '', model: 'К', category: 'tayyor', unit: 'dona', quantity: 37, minStock: 6, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-028', name: 'Дизел насос 150 лик', image: '', model: 'Дизел', category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-029', name: 'Д6300-27', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-030', name: 'НШ (YCB-20/0.6 7,5/1000)', image: '', model: 'НШ', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-031', name: 'НШ (YCB-40/0.6 11/1000)', image: '', model: 'НШ', category: 'tayyor', unit: 'dona', quantity: 11, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-032', name: 'НШ (КСВ-200 4/1500)', image: '', model: 'НШ', category: 'tayyor', unit: 'dona', quantity: 7, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-033', name: 'НШ (КСВ-55 1,5/1500)', image: '', model: 'НШ', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-034', name: 'НШ (КСВ-135 2,2/1000)', image: '', model: 'НШ', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-035', name: 'Д520-55 (LTQT10-520-55-110 кег мар)', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-036', name: 'ЦНС60-198 (D46-30х8 кег мар)', image: '', model: 'ЦНС', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-037', name: 'ЦНС180-170 (D155-30х6 кег мар)', image: '', model: 'ЦНС', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-038', name: 'ЦНС180-255 (D155-30х9 кег мар)', image: '', model: 'ЦНС', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-039', name: 'ЦНС400-150 (D360-40х4 кег мар)', image: '', model: 'ЦНС', category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-040', name: 'ЦНС400-210 (D360-40х6 кег мар)', image: '', model: 'ЦНС', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-041', name: 'ЦНС280-301 (D280-43х7 кег мар) 350/1500', image: '', model: 'ЦНС', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-042', name: 'IH125-100-315 30/1500', image: '', model: 'IH', category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-043', name: 'НПЛ12,5-12,5/16(UXL4)', image: '', model: 'НПЛ', category: 'tayyor', unit: 'dona', quantity: 20, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-044', name: 'НПЛ8-8/16(UXL4)', image: '', model: 'НПЛ', category: 'tayyor', unit: 'dona', quantity: 30, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-045', name: 'ВВН1-12 22/1500', image: '', model: 'ВВН', category: 'tayyor', unit: 'dona', quantity: 10, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'SN-046', name: 'ВВН1-6 15/1500', image: '', model: 'ВВН', category: 'tayyor', unit: 'dona', quantity: 30, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },

  // Astatka sklad — Elektrodvigatel va suv nasos komplektlari (29.06.2026)
  { code: 'KP-001', name: 'ГНОМ10-12 (A-QDX10-12 кег мар)', image: '', model: 'ГНОМ', kvt: 0.55, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 10, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-002', name: 'ГНОМ10-16 (QDX10-16 кег мар)', image: '', model: 'ГНОМ', kvt: 0.75, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-003', name: 'ГНОМ10-10', image: '', model: 'ГНОМ', kvt: 1.1, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 1330000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-004', name: 'ЛМ40-160', image: '', model: 'ЛМ', kvt: 2.2, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 5, minStock: 2, price: 3500000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-005', name: 'НС-2CHLF8-60 инвентрлик', image: '', model: 'НС', kvt: 2.2, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-006', name: 'YDHI12-40', image: '', model: 'YDHI', kvt: 2.2, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 39, minStock: 6, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-007', name: 'YDLFI8-60', image: '', model: 'YDLFI', kvt: 2.2, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 19, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-008', name: 'КМ40-160', image: '', model: 'КМ', kvt: 2.2, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-009', name: 'НС-2CHLF8-60 инвентрсиз', image: '', model: 'НС', kvt: 3, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-010', name: 'YDHI12-50', image: '', model: 'YDHI', kvt: 3, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 45, minStock: 7, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-011', name: 'YDHI8-60 инвентрлик', image: '', model: 'YDHI', kvt: 3, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 43, minStock: 6, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-012', name: 'YDH16-40 инвентерсиз', image: '', model: 'YDH', kvt: 3, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 30, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-013', name: 'YDH12-50 инвентерсиз', image: '', model: 'YDH', kvt: 3, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 23, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-014', name: 'YDH8-60 инвентерсиз', image: '', model: 'YDH', kvt: 3, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 19, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-015', name: 'ГНОМ15-25', image: '', model: 'ГНОМ', kvt: 3, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 40, minStock: 6, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-016', name: 'ГНОМ25-20', image: '', model: 'ГНОМ', kvt: 3, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 15, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-017', name: 'ГНОМ40-25', image: '', model: 'ГНОМ', kvt: 5.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 12, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-018', name: 'ГНОМ53-10', image: '', model: 'ГНОМ', kvt: 7.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 10, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-019', name: 'ГНОМ20-25', image: '', model: 'ГНОМ', kvt: 2.2, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 15, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-020', name: 'ВВН1-1.5', image: '', model: 'ВВН', kvt: 3.85, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 28, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-021', name: 'КМ65-160', image: '', model: 'КМ', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 20, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-022', name: 'ЛМ65-160', image: '', model: 'ЛМ', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 26, minStock: 4, price: 4860000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-023', name: 'ГНМ20-25', image: '', model: 'ГНМ', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 3500000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-024', name: 'YDLFI16-40', image: '', model: 'YDLFI', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 10, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-025', name: 'YDLFI8-120', image: '', model: 'YDLFI', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-026', name: 'YDHI20-40 инвентрлик', image: '', model: 'YDHI', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 30, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-027', name: 'YDH20-40 инвентерсиз', image: '', model: 'YDH', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 15, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-028', name: 'НС-2CHLF20-40 инвентрсиз', image: '', model: 'НС', kvt: 4, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-029', name: 'КМ65-160', image: '', model: 'КМ', kvt: 5.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 23, minStock: 3, price: 4000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-030', name: 'ЛМ65-160', image: '', model: 'ЛМ', kvt: 5.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 14, minStock: 3, price: 4200000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-031', name: 'ЛМ65-160а', image: '', model: 'ЛМ', kvt: 5.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-032', name: 'ВВН1-3 2BV-5111 кег мар', image: '', model: 'ВВН', kvt: 5.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 62, minStock: 9, price: 9660000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-033', name: '50YZ25-12', image: '', model: 'YZ', kvt: 5.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-034', name: 'АХ50-32-200', image: '', model: 'АХ', kvt: 5.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-035', name: 'ЭЦВ20-60', image: '', model: 'ЭЦВ', kvt: 5.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-036', name: 'КМ65-200', image: '', model: 'КМ', kvt: 7.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 9, minStock: 3, price: 8220000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-037', name: 'КМ80-160', image: '', model: 'КМ', kvt: 7.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-038', name: 'ЛМ80-160', image: '', model: 'ЛМ', kvt: 7.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 10, minStock: 3, price: 5450000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-039', name: 'LQZ20/50 (65CQ-35P кеган маркаси)', image: '', model: 'LQZ', kvt: 7.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-040', name: 'ВВН-1-3', image: '', model: 'ВВН', kvt: 7.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-041', name: '2BV-5121', image: '', model: 'BV', kvt: 7.5, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-042', name: 'AGM40CH160', image: '', model: 'AGM', kvt: 7.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-043', name: 'ЭЦВ YQS150', image: '', model: 'ЭЦВ', kvt: 7.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-044', name: 'КМ100-160', image: '', model: 'КМ', kvt: 11, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 10500000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-045', name: 'КМ100-160а', image: '', model: 'КМ', kvt: 11, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-046', name: 'К50-160', image: '', model: 'К', kvt: 11, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-047', name: 'ЭЦВ8-25-100', image: '', model: 'ЭЦВ', kvt: 11, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 21, minStock: 3, price: 12500000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-048', name: 'ЭЦВ8-40-60 (65)', image: '', model: 'ЭЦВ', kvt: 11, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 19, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-049', name: 'ГНМ100-25', image: '', model: 'ГНМ', kvt: 11, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-050', name: 'CDLF120-20-2', image: '', model: 'CDLF', kvt: 15, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-051', name: 'КМ65-250', image: '', model: 'КМ', kvt: 15, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 10, minStock: 3, price: 13970000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-052', name: 'КМ80-200', image: '', model: 'КМ', kvt: 15, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 15, minStock: 3, price: 13660000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-053', name: 'КМ100-200', image: '', model: 'КМ', kvt: 15, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 15, minStock: 3, price: 10500000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-054', name: 'КМ100-160', image: '', model: 'КМ', kvt: 15, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 11, minStock: 3, price: 12260000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-055', name: 'ЛМ80-200', image: '', model: 'ЛМ', kvt: 15, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-056', name: 'ЭЦВ40-90', image: '', model: 'ЭЦВ', kvt: 15, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 12, minStock: 3, price: 13800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-057', name: 'ВВН1-6 (2SK-6 кег мар)', image: '', model: 'ВВН', kvt: 15, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 9, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-058', name: 'КМ100-200', image: '', model: 'КМ', kvt: 18.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 29, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-059', name: 'КМ80-250', image: '', model: 'КМ', kvt: 18.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 5, minStock: 2, price: 15600000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-060', name: 'ЭЦВ10-63-65', image: '', model: 'ЭЦВ', kvt: 18.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 20, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-061', name: 'ЭЦВ8-40-90 (91)', image: '', model: 'ЭЦВ', kvt: 18.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 20, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-062', name: 'CDLF20-150', image: '', model: 'CDLF', kvt: 18.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-063', name: 'ЭЦВ 5SP-10-37-18.5', image: '', model: 'ЭЦВ', kvt: 18.5, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-064', name: 'К300-300', image: '', model: 'К', kvt: 22, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 27320000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-065', name: 'КМ100-220', image: '', model: 'КМ', kvt: 22, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 89, minStock: 13, price: 22950000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-066', name: 'CHLF100-220', image: '', model: 'CHLF', kvt: 22, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-067', name: 'КМ200-250', image: '', model: 'КМ', kvt: 22, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-068', name: 'SP125-100-200', image: '', model: 'SP', kvt: 22, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 124, minStock: 19, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-069', name: 'ВВН1-12', image: '', model: 'ВВН', kvt: 22, rpm: 300, category: 'tayyor', unit: 'dona', quantity: 10, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-070', name: 'К300-300', image: '', model: 'К', kvt: 30, rpm: 1000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 27320000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-071', name: 'КМ100-230', image: '', model: 'КМ', kvt: 30, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 16, minStock: 3, price: 28050000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-072', name: 'СМ100-65-200', image: '', model: 'СМ', kvt: 30, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 15300000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-073', name: 'CDLF16-300', image: '', model: 'CDLF', kvt: 30, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-074', name: 'CDLF150-30-2 (Инвекториям кеган)', image: '', model: 'CDLF', kvt: 30, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-075', name: 'ЭЦВ10-120-55', image: '', model: 'ЭЦВ', kvt: 32, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 7, minStock: 3, price: 13800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-076', name: 'ЭЦВ12-255-30', image: '', model: 'ЭЦВ', kvt: 32, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 3, minStock: 2, price: 21500000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-077', name: 'ЭЦВ10-63-110', image: '', model: 'ЭЦВ', kvt: 32, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 19600000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-078', name: 'К400-400', image: '', model: 'К', kvt: 37, rpm: 750, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 38000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-079', name: 'ЭЦВ10-120-80', image: '', model: 'ЭЦВ', kvt: 37, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 19, minStock: 3, price: 20700000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-080', name: 'SNP80/250', image: '', model: 'SNP', kvt: 37, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-081', name: 'КМ200-400', image: '', model: 'КМ', kvt: 37, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-082', name: 'К(М)150-125-315', image: '', model: 'К', kvt: 37, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-083', name: 'НС-3 YDLFI150-30 (CDLF150-30 дан НС-3 1та кампл)', image: '', model: 'НС', kvt: 37, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-084', name: 'К(М)150-125-400', image: '', model: 'К', kvt: 45, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-085', name: 'К100-65-200', image: '', model: 'К', kvt: 45, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-086', name: 'Д320-50 (АИР225М4 мотори)', image: '', model: 'Д', kvt: 55, rpm: 1500, category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 39000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-087', name: 'К500-500', image: '', model: 'К', kvt: 55, rpm: 600, category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 110000000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-088', name: 'ЭЦВ 8SP-95-20-93', image: '', model: 'ЭЦВ', kvt: 93, rpm: 3000, category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KP-089', name: 'SW3H6000-L4 (400м/3/50 HZ) компрессор', image: '', model: 'SW', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },

  // Astatka sklad — Rotorlar (29.06.2026)
  { code: 'RO-001', name: 'Д1250-125', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 4, minStock: 2, price: 17900000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-002', name: 'Д630-90', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 10500000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-003', name: '300Д90', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 6, minStock: 3, price: 11200000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-004', name: 'Д1250-65', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 11, minStock: 3, price: 12100000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-005', name: 'Д1600-90', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 9, minStock: 3, price: 18400000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-006', name: '350Д90', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 23, minStock: 3, price: 15600000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-007', name: 'Д2000-21', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 0, minStock: 2, price: 17700000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-008', name: 'Д4000-95', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 2, minStock: 2, price: 45800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-009', name: 'Д1250-125 зав', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 17900000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'RO-010', name: 'Д1250-100', image: '', model: 'Д', category: 'tayyor', unit: 'dona', quantity: 1, minStock: 2, price: 14800000, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },

  // Astatka sklad — Boshqa mahsulotlar / butlovchi qisimlar (29.06.2026)
  { code: 'BQ-001', name: 'Фланс 250', image: '', model: 'Фланс', category: 'yarim', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'BQ-002', name: 'Фланс', image: '', model: 'Фланс', category: 'yarim', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'BQ-003', name: 'Насос К400-Ремонт Келиб ремонт булиб чикиб кетти', image: '', model: 'Насос', category: 'yarim', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'BQ-004', name: 'Гилза, Калсо Втулка', image: '', model: 'Гилза', category: 'yarim', unit: 'dona', quantity: 8, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'BQ-005', name: 'Литё', image: '', model: 'Литё', category: 'yarim', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'BQ-006', name: '14 Д 6 корпус подчивник', image: '', model: 'Д', category: 'yarim', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },

  // Astatka sklad — Elektrodvigatel korpuslari (29.06.2026)
  { code: 'KR-001', name: 'АИР80', image: '', model: 'АИР', category: 'yarim', unit: 'dona', quantity: 927, minStock: 139, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-002', name: 'АИР90', image: '', model: 'АИР', category: 'yarim', unit: 'dona', quantity: 1059, minStock: 159, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-003', name: 'АИР100', image: '', model: 'АИР', category: 'yarim', unit: 'dona', quantity: 1220, minStock: 183, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-004', name: 'АИР112', image: '', model: 'АИР', category: 'yarim', unit: 'dona', quantity: 389, minStock: 58, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-005', name: 'АИР80МВ2', image: '', model: 'АИР', kvt: 2.2, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 12, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-006', name: 'АИР90L4', image: '', model: 'АИР', kvt: 2.2, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 45, minStock: 7, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-007', name: 'АИР100L6', image: '', model: 'АИР', kvt: 2.2, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 43, minStock: 6, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-008', name: 'АИР100S4', image: '', model: 'АИР', kvt: 3, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 13, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-009', name: 'АИР112МА6', image: '', model: 'АИР', kvt: 3, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 20, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-010', name: 'АИР100S2', image: '', model: 'АИР', kvt: 4, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 71, minStock: 11, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-011', name: 'АИР100L4', image: '', model: 'АИР', kvt: 4, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 50, minStock: 8, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-012', name: 'АИР112МВ6', image: '', model: 'АИР', kvt: 4, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 17, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-013', name: 'АИР100L2', image: '', model: 'АИР', kvt: 5.5, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 130, minStock: 20, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-014', name: 'АИР112М4', image: '', model: 'АИР', kvt: 5.5, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 10, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-015', name: 'АИР132S6', image: '', model: 'АИР', kvt: 5.5, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 34, minStock: 5, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-016', name: 'АИР112М2', image: '', model: 'АИР', kvt: 7.5, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 81, minStock: 12, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-017', name: 'АИР132М4', image: '', model: 'АИР', kvt: 7.5, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 71, minStock: 11, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-018', name: 'АИР132М6', image: '', model: 'АИР', kvt: 7.5, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 6, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-019', name: 'АИР132М2', image: '', model: 'АИР', kvt: 11, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 109, minStock: 16, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-020', name: 'АИР132S4', image: '', model: 'АИР', kvt: 11, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-021', name: 'АИР160S6', image: '', model: 'АИР', kvt: 11, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-022', name: 'АИР160S2', image: '', model: 'АИР', kvt: 15, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 71, minStock: 11, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-023', name: 'АИР160М6', image: '', model: 'АИР', kvt: 15, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-024', name: 'АИР160М2', image: '', model: 'АИР', kvt: 18.5, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 164, minStock: 25, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-025', name: 'АИР160М4', image: '', model: 'АИР', kvt: 18.5, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-026', name: 'АИР200М8', image: '', model: 'АИР', kvt: 18.5, rpm: 750, category: 'yarim', unit: 'dona', quantity: 28, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-027', name: 'АИР180S2', image: '', model: 'АИР', kvt: 22, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 152, minStock: 23, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-028', name: 'АИР180S4', image: '', model: 'АИР', kvt: 22, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 30, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-029', name: 'АИР200М6', image: '', model: 'АИР', kvt: 22, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 11, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-030', name: 'АИР180М2', image: '', model: 'АИР', kvt: 30, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 161, minStock: 24, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-031', name: 'АИР200L6', image: '', model: 'АИР', kvt: 30, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 23, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-032', name: 'АИР225М8', image: '', model: 'АИР', kvt: 30, rpm: 750, category: 'yarim', unit: 'dona', quantity: 13, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-033', name: 'АИР200М2', image: '', model: 'АИР', kvt: 37, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-034', name: 'АИР200М4', image: '', model: 'АИР', kvt: 37, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 26, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-035', name: 'АИР225М6', image: '', model: 'АИР', kvt: 37, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 22, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-036', name: 'АИР250S8', image: '', model: 'АИР', kvt: 37, rpm: 750, category: 'yarim', unit: 'dona', quantity: 18, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-037', name: 'АИР200L4', image: '', model: 'АИР', kvt: 45, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 18, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-038', name: 'АИР200L2', image: '', model: 'АИР', kvt: 45, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-039', name: 'АИР225М2', image: '', model: 'АИР', kvt: 55, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 7, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-040', name: 'АИР225М4', image: '', model: 'АИР', kvt: 55, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 0, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-041', name: 'АИР250М6', image: '', model: 'АИР', kvt: 55, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-042', name: 'АИР250S2', image: '', model: 'АИР', kvt: 75, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 36, minStock: 5, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-043', name: 'АИР280S6', image: '', model: 'АИР', kvt: 75, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 28, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-044', name: 'АИР280M8', image: '', model: 'АИР', kvt: 75, rpm: 750, category: 'yarim', unit: 'dona', quantity: 26, minStock: 4, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-045', name: 'АИР250М2', image: '', model: 'АИР', kvt: 90, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 21, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-046', name: 'АИР250М4', image: '', model: 'АИР', kvt: 90, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 23, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-047', name: 'АИР280S2', image: '', model: 'АИР', kvt: 110, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 2, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-048', name: 'АИР315S6', image: '', model: 'АИР', kvt: 110, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-049', name: 'АИР315М8', image: '', model: 'АИР', kvt: 110, rpm: 750, category: 'yarim', unit: 'dona', quantity: 8, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-050', name: 'АИР355S8', image: '', model: 'АИР', kvt: 132, rpm: 750, category: 'yarim', unit: 'dona', quantity: 10, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-051', name: 'АИР315S2', image: '', model: 'АИР', kvt: 160, rpm: 3000, category: 'yarim', unit: 'dona', quantity: 9, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-052', name: 'АИР355S6', image: '', model: 'АИР', kvt: 160, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 1, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-053', name: 'АИР355M8', image: '', model: 'АИР', kvt: 160, rpm: 750, category: 'yarim', unit: 'dona', quantity: 3, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-054', name: 'АИР315М4', image: '', model: 'АИР', kvt: 200, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 7, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-055', name: 'АИР355М6', image: '', model: 'АИР', kvt: 200, rpm: 1000, category: 'yarim', unit: 'dona', quantity: 23, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-056', name: 'АИР355S4', image: '', model: 'АИР', kvt: 250, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 4, minStock: 2, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
  { code: 'KR-057', name: 'АИР355М4', image: '', model: 'АИР', kvt: 315, rpm: 1500, category: 'yarim', unit: 'dona', quantity: 18, minStock: 3, price: 0, warehouse: 'Astatka Sklad', updatedAt: '2026-06-29' },
]

// Bumping this forces browsers with stale persisted data (e.g. the old mock
// seed) to pick up the current `seed` array instead of ignoring it.
const SEED_VERSION = '2026-06-29-astatka-sklad'
const SEED_VERSION_KEY = 'nammotors_products_seed_version'

export const useProductsStore = defineStore('products', () => {
  const freshSeed = () => seed.map((p) => ({ ...p, id: id() }))
  const items = ref<Product[]>(
    localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION ? loadPersisted('products', freshSeed()) : freshSeed(),
  )
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
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
