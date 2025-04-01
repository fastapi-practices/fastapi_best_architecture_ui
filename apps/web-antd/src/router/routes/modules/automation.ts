import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'automation',
    path: '/automation',
    meta: {
      title: $t('page.menu.automation'),
      icon: 'icon-code-square',
      order: 2,
    },
    children: [
      {
        name: 'CodeGenerator',
        path: 'code-generator',
        component: () => import('#/views/automation/code-generator/index.vue'),
        meta: {
          title: $t('page.menu.codeGenerator'),
        },
      },
    ],
  },
];

export default routes;
