import type { RouteRecordRaw } from 'vue-router';

import { $t } from '@vben/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      title: $t('page.menu.profile'),
      icon: 'mingcute:profile-line',
      hideInMenu: true,
    },
  },
];

export default routes;
