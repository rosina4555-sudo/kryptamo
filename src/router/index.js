import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/send',
      name: 'send',
      component: () => import('../views/SendView.vue'),
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/transfers',
      name: 'transfers',
      component: () => import('../views/HistoryView.vue'),
    },
    {
      path: '/transfers/:id',
      name: 'transfer-tracking',
      component: () => import('../views/TrackingView.vue'),
    },
    {
      path: '/transfers/:id/receipt',
      name: 'transfer-receipt',
      component: () => import('../views/ReceiptView.vue'),
    },
  ],
})

export default router