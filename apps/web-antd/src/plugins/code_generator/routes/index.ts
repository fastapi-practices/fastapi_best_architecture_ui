import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'PluginCodeGenerator',
    path: '/plugins/code-generator',
    component: () => import('#/plugins/code_generator/views/index.vue'),
    meta: {
      title: $t('code_generator.menu'),
      icon: 'tabler:code',
    },
  },
];

export default routes;
