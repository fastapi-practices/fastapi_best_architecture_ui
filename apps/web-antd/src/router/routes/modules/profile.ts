import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'mingcute:profile-line',
      title: '个人中心',
      hideInMenu: true,
    },
  },
];

export default routes;
