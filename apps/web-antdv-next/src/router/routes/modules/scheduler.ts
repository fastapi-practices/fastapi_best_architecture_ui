import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Scheduler',
    path: '/scheduler',
    meta: {
      title: $t('page.menu.scheduler'),
      icon: 'ix:scheduler',
    },
    children: [
      {
        name: 'SchedulerManage',
        path: '/scheduler/manage',
        component: () => import('#/views/scheduler/manage/index.vue'),
        meta: {
          title: $t('page.menu.schedulerManage'),
          icon: 'ix:scheduler',
        },
      },
      {
        name: 'SchedulerRecord',
        path: '/scheduler/record',
        component: () => import('#/views/scheduler/record/index.vue'),
        meta: {
          title: $t('page.menu.schedulerRecord'),
          icon: 'ix:scheduler',
        },
      },
    ],
  },
];

export default routes;
