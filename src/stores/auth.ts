import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useEmployeesStore, type PermissionKey } from './employees'
import { useSuppliersStore } from './suppliers'

const STORAGE_KEY = 'nammotors_session'
const SUPPLIER_STORAGE_KEY = 'nammotors_supplier_session'

export const useAuthStore = defineStore('auth', () => {
  const employees = useEmployeesStore()
  const suppliers = useSuppliersStore()
  const username = ref<string | null>(
    localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY),
  )
  const supplierUsername = ref<string | null>(
    localStorage.getItem(SUPPLIER_STORAGE_KEY) ?? sessionStorage.getItem(SUPPLIER_STORAGE_KEY),
  )
  // Holds an i18n message key (see src/i18n/locales), or '' when there's no error.
  const error = ref('')
  const loading = ref(false)

  const user = computed(() => (username.value ? (employees.findByUsername(username.value) ?? null) : null))
  const supplierUser = computed(() =>
    supplierUsername.value ? (suppliers.findByUsername(supplierUsername.value) ?? null) : null,
  )

  function hasPermission(key: PermissionKey) {
    return !!user.value?.permissions.includes(key)
  }

  function login(usernameInput: string, password: string, remember = true): boolean {
    error.value = ''
    loading.value = true
    const record = employees.findByCredentials(usernameInput, password)
    loading.value = false
    if (!record) {
      error.value = 'auth.invalidCredentials'
      return false
    }
    username.value = record.username
    const target = remember ? localStorage : sessionStorage
    target.setItem(STORAGE_KEY, record.username)
    return true
  }

  function logout() {
    username.value = null
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  function loginSupplier(usernameInput: string, password: string, remember = true): boolean {
    error.value = ''
    loading.value = true
    const record = suppliers.findByCredentials(usernameInput, password)
    loading.value = false
    if (!record) {
      error.value = 'auth.invalidCredentials'
      return false
    }
    supplierUsername.value = record.username
    const target = remember ? localStorage : sessionStorage
    target.setItem(SUPPLIER_STORAGE_KEY, record.username)
    return true
  }

  function logoutSupplier() {
    supplierUsername.value = null
    localStorage.removeItem(SUPPLIER_STORAGE_KEY)
    sessionStorage.removeItem(SUPPLIER_STORAGE_KEY)
  }

  return {
    user,
    supplierUser,
    error,
    loading,
    login,
    logout,
    loginSupplier,
    logoutSupplier,
    hasPermission,
  }
})
