import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'OAuth2Callback',
    path: '/oauth2/callback',
    component: () => import('#/plugins/oauth2/views/index.vue'),
    meta: {
      icon: 'mingcute:profile-line',
      title: '第三方登录',
      hideInMenu: true,
    },
  },
];

export default routes;
