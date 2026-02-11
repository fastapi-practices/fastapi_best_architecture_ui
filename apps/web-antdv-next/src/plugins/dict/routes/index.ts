import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'PluginDict',
    path: '/plugins/dict',
    component: () => import('#/plugins/dict/views/index.vue'),
    meta: {
      title: $t('dict.menu'),
      icon: 'fluent-mdl2:dictionary',
    },
  },
];

export default routes;
