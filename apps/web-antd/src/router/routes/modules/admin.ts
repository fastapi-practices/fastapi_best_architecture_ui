import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'admin',
    path: '/admin',
    meta: {
      title: $t('page.menu.admin'),
      icon: 'icon-settings',
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
        name: 'SysApi',
        path: 'sys-api',
        component: () => import('#/views/admin/api/index.vue'),
        meta: {
          title: $t('page.menu.sysApi'),
        },
      },
      {
        name: 'SysDataRule',
        path: 'sys-data-rule',
        component: () => import('#/views/admin/data-rule/index.vue'),
        meta: {
          title: $t('page.menu.sysDataRule'),
        },
      },
    ],
  },
];

export default routes;
