import type { RouteRecordRaw } from 'vue-router';

import { IFrameView } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      badgeType: 'dot',
      icon: 'https://wu-clan.github.io/picx-images-hosting/logo/fba.png',
      order: 9998,
      title: $t('demos.vben.title'),
    },
    name: 'VbenProject',
    path: '/fba-admin',
    children: [
      {
        name: 'VbenDocument',
        path: '/fba-admin/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: 'https://fastapi-practices.github.io/fastapi_best_architecture_docs',
          title: $t('demos.vben.document'),
        },
      },
      {
        name: 'VbenGithub',
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
      title: $t('demos.vben.about'),
      order: 9999,
    },
  },
];

export default routes;
