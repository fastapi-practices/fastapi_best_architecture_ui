import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'System',
    path: '/system',
    meta: {
      title: $t('page.menu.system'),
      icon: 'grommet-icons:system',
      order: 1,
    },
    children: [
      {
        name: 'SysDept',
        path: 'sys-dept',
        component: () => import('#/views/system/dept/index.vue'),
        meta: {
          title: $t('page.menu.sysDept'),
        },
      },
      {
        name: 'SysUser',
        path: 'sys-user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          title: $t('page.menu.sysUser'),
        },
      },
      {
        name: 'SysRole',
        path: 'sys-role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          title: $t('page.menu.sysRole'),
        },
      },
      {
        name: 'SysMenu',
        path: 'sys-menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: {
          title: $t('page.menu.sysMenu'),
        },
      },
      {
        name: 'SysDataPermission',
        path: 'sys-data-permission',
        component: () => import('#/views/system/data-permission/index.vue'),
        meta: {
          title: $t('page.menu.sysDataPermission'),
        },
      },
      {
        name: 'SysPlugin',
        path: 'sys-plugin',
        component: () => import('#/views/system/plugin/index.vue'),
        meta: {
          title: $t('page.menu.SysPlugin'),
        },
      },
    ],
  },
];

export default routes;
