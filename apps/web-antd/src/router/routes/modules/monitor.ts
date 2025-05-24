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
        path: 'online',
        component: () => import('#/views/monitor/online/index.vue'),
        meta: {
          title: $t('page.menu.online'),
        },
      },
      {
        name: 'Redis',
        path: 'redis',
        component: () => import('#/views/monitor/redis/index.vue'),
        meta: {
          title: $t('page.menu.redis'),
        },
      },
      {
        name: 'Server',
        path: 'server',
        component: () => import('#/views/monitor/server/index.vue'),
        meta: {
          title: $t('page.menu.server'),
        },
      },
    ],
  },
];

export default routes;
