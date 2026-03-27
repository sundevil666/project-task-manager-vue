import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Projects',
    component: () => import('../pages/ProjectsPage.vue')
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('../pages/ProjectDetail.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})


export default router
