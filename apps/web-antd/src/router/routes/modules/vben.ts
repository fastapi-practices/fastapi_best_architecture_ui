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
    path: '/fba',
    children: [
      {
        name: 'Document',
        path: '/fba/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: 'https://fastapi-practices.github.io/fastapi_best_architecture_docs',
          title: '文档',
        },
      },
      {
        name: 'Github',
        path: '/fba/github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: 'https://github.com/fastapi-practices/fastapi_best_architecture',
          title: 'Github',
        },
      },
      {
        name: 'Apifox',
        path: '/fba/apifox',
        component: IFrameView,
        meta: {
          icon: 'simple-icons:apifox',
          iframeSrc:
            'https://apifox.com/apidoc/shared-28a93f02-730b-4f33-bb5e-4dad92058cc0',
          title: 'Apifox',
        },
      },
    ],
  },
  {
    name: 'VbenAbout',
    path: '/about',
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:copyright',
      title: '关于项目',
      order: 9999,
    },
  },
];

export default routes;
