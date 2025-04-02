import type { RouteRecordRaw } from 'vue-router';

import { IFrameView } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      badgeType: 'dot',
      icon: 'https://wu-clan.github.io/picx-images-hosting/logo/fba.png',
      order: 9998,
      title: '项目',
    },
    name: 'VbenProject',
    path: '/fba-admin',
    children: [
      {
        name: 'Document',
        path: '/fba-admin/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: 'https://fastapi-practices.github.io/fastapi_best_architecture_docs',
          title: '文档',
        },
      },
      {
        name: 'Github',
        path: '/fba-admin/github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: 'https://github.com/fastapi-practices/fastapi_best_architecture',
          title: 'Github',
        },
      },
    ],
  },
  {
    name: 'VbenAbout',
    path: '/vben-admin/about',
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:copyright',
      title: '关于项目',
      order: 9999,
    },
  },
];

export default routes;
