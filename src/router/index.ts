import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/AdminLoginView.vue'),
    meta: { title: 'Acceso administrativo' },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: { title: 'Administracion', requiresAuth: true },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/AdminUsersView.vue'),
    meta: { title: 'Usuarios administradores', requiresAuth: true },
  },
  {
    path: '/pay-response',
    name: 'PayResponse',
    component: () => import('../views/OrderStatusView.vue'),
    meta: { title: 'Respuesta de pago' },
  },
  {
    path: '/order-status',
    name: 'OrderStatus',
    component: () => import('../views/OrderStatusView.vue'),
    meta: { title: 'Estado de pedido' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to, _from, next) => {
  const hasToken = !!localStorage.getItem('access_token')
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)

  if (requiresAuth && !hasToken) {
    return next({ path: '/login', replace: true })
  }

  if (to.path === '/login' && hasToken) {
    return next({ path: '/', replace: true })
  }

  next()
})

export default router
