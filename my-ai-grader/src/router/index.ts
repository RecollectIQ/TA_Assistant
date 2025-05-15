import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import ProfileManagementView from '@/views/ProfileManagementView.vue';
import GradingView from '@/views/GradingView.vue';
import StandardAnswerView from '@/views/StandardAnswerView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/profile-management',
    name: 'ProfileManagement',
    component: ProfileManagementView,
  },
  {
    path: '/grading',
    name: 'Grading',
    component: GradingView,
  },
  {
    path: '/standard-answer',
    name: 'StandardAnswer',
    component: StandardAnswerView,
  },
  // Fallback route for 404 - optional for now
  // {
  //   path: '/:catchAll(.*)*',
  //   name: 'NotFound',
  //   component: () => import('@/views/NotFoundView.vue'), // Example for a NotFound view
  // },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
