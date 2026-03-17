import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'PluginApiKey',
    path: '/plugins/api-key',
    component: () => import('#/plugins/api_key/views/index.vue'),
    meta: {
      title: $t('api_key.menu'),
      icon: 'mdi:key-outline',
    },
  },
];

export default routes;
