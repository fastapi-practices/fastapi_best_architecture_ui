import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Automation',
    path: '/automation',
    meta: {
      title: $t('page.menu.automation'),
      icon: 'material-symbols:automation',
      order: 2,
    },
    children: [
      {
        name: 'CodeGenerator',
        path: 'code-generator',
        component: () => import('#/views/automation/code-generator/index.vue'),
        meta: {
          title: $t('page.menu.codeGenerator'),
          icon: 'tabler:code',
        },
      },
      {
        name: 'Scheduler',
        path: 'scheduler',
        component: () => import('#/views/automation/scheduler/index.vue'),
        meta: {
          title: $t('page.menu.scheduler'),
          icon: 'ix:scheduler',
        },
      },
    ],
  },
];

export default routes;
