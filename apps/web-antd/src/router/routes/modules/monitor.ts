import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Monitor',
    path: '/monitor',
    meta: {
      title: $t('page.menu.monitor'),
      icon: 'mdi:monitor-eye',
      order: 4,
    },
    children: [
      {
        name: 'Online',
        path: '/monitor/online',
        component: () => import('#/views/monitor/online/index.vue'),
        meta: {
          title: $t('page.menu.online'),
          icon: 'wpf:online',
        },
      },
      {
        name: 'Redis',
        path: '/monitor/redis',
        component: () => import('#/views/monitor/redis/index.vue'),
        meta: {
          title: $t('page.menu.redis'),
          icon: 'devicon:redis',
        },
      },
      {
        name: 'Server',
        path: '/monitor/server',
        component: () => import('#/views/monitor/server/index.vue'),
        meta: {
          title: $t('page.menu.server'),
          icon: 'mdi:server-outline',
        },
      },
    ],
  },
];

export default routes;
