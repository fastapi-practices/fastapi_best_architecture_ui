import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Admin',
    path: '/admin',
    meta: {
      title: $t('page.menu.admin'),
      icon: 'eos-icons:admin',
      order: 1,
    },
    children: [
      {
        name: 'SysDept',
        path: 'sys-dept',
        component: () => import('#/views/admin/dept/index.vue'),
        meta: {
          title: $t('page.menu.sysDept'),
        },
      },
      {
        name: 'SysUser',
        path: 'sys-user',
        component: () => import('#/views/admin/user/index.vue'),
        meta: {
          title: $t('page.menu.sysUser'),
        },
      },
      {
        name: 'SysRole',
        path: 'sys-role',
        component: () => import('#/views/admin/role/index.vue'),
        meta: {
          title: $t('page.menu.sysRole'),
        },
      },
      {
        name: 'SysMenu',
        path: 'sys-menu',
        component: () => import('#/views/admin/menu/index.vue'),
        meta: {
          title: $t('page.menu.sysMenu'),
        },
      },
      {
        name: 'SysDataPermission',
        path: 'sys-data-permission',
        component: () => import('#/views/admin/data-permission/index.vue'),
        meta: {
          title: $t('page.menu.sysDataPermission'),
        },
      },
      {
        name: 'SysPlugin',
        path: 'sys-plugin',
        component: () => import('#/views/admin/plugin/index.vue'),
        meta: {
          title: $t('page.menu.SysPlugin'),
        },
      },
    ],
  },
];

export default routes;
