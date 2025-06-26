import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'PluginConfig',
    path: '/plugins/config',
    component: () => import('#/plugins/config/views/index.vue'),
    meta: {
      title: $t('config.menu'),
      icon: 'codicon:symbol-parameter',
    },
  },
];

export default routes;
