import { ref } from 'vue'
import { defineStore } from 'pinia'
import { computeNextId, loadPersisted, persist } from '@/utils/persist'

export type PermissionKey =
  | 'products.tayyor'
  | 'products.yarim'
  | 'products.xomashyo'
  | 'models'
  | 'warehouses'
  | 'suppliers'
  | 'employees'
  | 'logs'

// Values are i18n message keys (see src/i18n/locales) — resolve with t() at the call site.
export const permissionMeta: Record<PermissionKey, string> = {
  'products.tayyor': 'permission.productsTayyor',
  'products.yarim': 'permission.productsYarim',
  'products.xomashyo': 'permission.productsXomashyo',
  models: 'permission.models',
  warehouses: 'permission.warehouses',
  suppliers: 'permission.suppliers',
  employees: 'permission.employees',
  logs: 'permission.logs',
}

export const ALL_PERMISSIONS = Object.keys(permissionMeta) as PermissionKey[]

export interface Employee {
  id: string
  username: string
  password: string
  fullName: string
  role: string
  permissions: PermissionKey[]
  // Name of the single warehouse/filial this employee belongs to; '' means unassigned (e.g. admin overseeing all).
  warehouse: string
  active: boolean
}

let nextId = 1
function id() {
  return `E${String(nextId++).padStart(3, '0')}`
}

const seed: Omit<Employee, 'id'>[] = [
  {
    username: 'admin',
    password: 'admin123',
    fullName: 'Administrator',
    role: 'Bosh administrator',
    permissions: [...ALL_PERMISSIONS],
    warehouse: '',
    active: true,
  },
  {
    username: 'ombor',
    password: 'ombor123',
    fullName: 'Ombor mudiri',
    role: 'Ombor mudiri',
    permissions: ['products.tayyor', 'products.yarim', 'products.xomashyo', 'warehouses', 'models', 'suppliers'],
    warehouse: 'Ombor-1',
    active: true,
  },
  {
    username: 'ishchi',
    password: 'ishchi123',
    fullName: 'Ishlab chiqarish ishchisi',
    role: 'Ishlab chiqarish ishchisi',
    permissions: ['products.yarim'],
    warehouse: 'Sex-3',
    active: true,
  },
  {
    username: 'dilnoza',
    password: 'dilnoza123',
    fullName: 'Dilnoza Yusupova',
    role: 'Buxgalter',
    permissions: ['products.tayyor', 'products.yarim', 'products.xomashyo', 'logs'],
    warehouse: '',
    active: true,
  },
  {
    username: 'sardor',
    password: 'sardor123',
    fullName: "Sardor To'rayev",
    role: 'Ombor-2 mudiri',
    permissions: ['products.tayyor', 'products.xomashyo', 'warehouses'],
    warehouse: 'Ombor-2',
    active: true,
  },
  {
    username: 'gulnora',
    password: 'gulnora123',
    fullName: 'Gulnora Rashidova',
    role: 'Sex-2 texnologi',
    permissions: ['products.yarim', 'models'],
    warehouse: 'Sex-2',
    active: true,
  },
  {
    username: 'jasur',
    password: 'jasur123',
    fullName: 'Jasur Ergashev',
    role: 'Sotuv menejeri',
    permissions: ['products.tayyor', 'suppliers'],
    warehouse: 'Filial-1',
    active: false,
  },
]

export const useEmployeesStore = defineStore('employees', () => {
  const items = ref<Employee[]>(loadPersisted('employees', seed.map((e) => ({ ...e, id: id() }))))
  nextId = computeNextId(items.value, 'E')
  persist('employees', items)

  function findByCredentials(username: string, password: string) {
    const uname = username.trim().toLowerCase()
    return items.value.find((e) => e.active && e.username.toLowerCase() === uname && e.password === password)
  }

  function findByUsername(username: string) {
    const uname = username.trim().toLowerCase()
    return items.value.find((e) => e.username.toLowerCase() === uname)
  }

  function addEmployee(payload: Omit<Employee, 'id'>) {
    items.value.unshift({ ...payload, id: id() })
  }

  function updateEmployee(eid: string, payload: Partial<Omit<Employee, 'id'>>) {
    const idx = items.value.findIndex((e) => e.id === eid)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...payload } as Employee
    }
  }

  function removeEmployee(eid: string) {
    items.value = items.value.filter((e) => e.id !== eid)
  }

  return { items, findByCredentials, findByUsername, addEmployee, updateEmployee, removeEmployee }
})
