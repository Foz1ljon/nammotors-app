import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { PermissionKey } from '@/stores/employees'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { titleKey: 'sidebar.dashboard' },
        },
        {
          path: 'mahsulotlar/tayyor',
          name: 'products-tayyor',
          component: () => import('@/views/products/ProductsView.vue'),
          props: { category: 'tayyor' },
          meta: { titleKey: 'sidebar.productsTayyor', permission: 'products.tayyor' as PermissionKey },
        },
        {
          path: 'mahsulotlar/yarim-tayyor',
          name: 'products-yarim',
          component: () => import('@/views/products/ProductsView.vue'),
          props: { category: 'yarim' },
          meta: { titleKey: 'sidebar.productsYarim', permission: 'products.yarim' as PermissionKey },
        },
        {
          path: 'mahsulotlar/xomashyo',
          name: 'products-xomashyo',
          component: () => import('@/views/products/ProductsView.vue'),
          props: { category: 'xomashyo' },
          meta: { titleKey: 'sidebar.productsXomashyo', permission: 'products.xomashyo' as PermissionKey },
        },
        {
          path: 'modellar',
          name: 'models',
          component: () => import('@/views/ModelsView.vue'),
          meta: { titleKey: 'sidebar.models', permission: 'models' as PermissionKey },
        },
        {
          path: 'omborlar',
          name: 'warehouses',
          component: () => import('@/views/WarehousesView.vue'),
          meta: { titleKey: 'sidebar.warehouses', permission: 'warehouses' as PermissionKey },
        },
        {
          path: 'mijozlar',
          name: 'customers',
          component: () => import('@/views/CustomersView.vue'),
          meta: { titleKey: 'sidebar.customers', permission: 'customers' as PermissionKey },
        },
        {
          path: 'tamirlash',
          name: 'repairs',
          component: () => import('@/views/RepairsView.vue'),
          meta: { titleKey: 'sidebar.repairs', permission: 'repairs' as PermissionKey },
        },
        {
          path: 'yetkazib-beruvchilar',
          name: 'suppliers',
          component: () => import('@/views/SuppliersView.vue'),
          meta: { titleKey: 'sidebar.suppliers', permission: 'suppliers' as PermissionKey },
        },
        {
          path: 'xodimlar',
          name: 'employees',
          component: () => import('@/views/EmployeesView.vue'),
          meta: { titleKey: 'sidebar.employees', permission: 'employees' as PermissionKey },
        },
        {
          path: 'amallar-tarixi',
          name: 'logs',
          component: () => import('@/views/LogsView.vue'),
          meta: { titleKey: 'sidebar.logs', permission: 'logs' as PermissionKey },
        },
      ],
    },
    {
      path: '/yetkazib-beruvchi-panel',
      component: () => import('@/layouts/SupplierPortalLayout.vue'),
      meta: { supplierArea: true },
      children: [
        {
          path: '',
          name: 'supplier-portal',
          component: () => import('@/views/supplier/SupplierPortalView.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.user) return { path: '/' }
    if (auth.supplierUser) return { path: '/yetkazib-beruvchi-panel' }
    return true
  }

  if (to.meta.supplierArea) {
    if (!auth.supplierUser) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    return true
  }

  if (!auth.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  const permission = to.meta.permission as PermissionKey | undefined
  if (permission && !auth.hasPermission(permission)) {
    return { path: '/' }
  }
  return true
})

export default router
