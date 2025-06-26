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
        path: '/system/dept',
        component: () => import('#/views/system/dept/index.vue'),
        meta: {
          title: $t('page.menu.sysDept'),
          icon: 'mingcute:department-line',
        },
      },
      {
        name: 'SysUser',
        path: '/system/user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          title: $t('page.menu.sysUser'),
          icon: 'ant-design:user-outlined',
        },
      },
      {
        name: 'SysRole',
        path: '/system/role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          title: $t('page.menu.sysRole'),
          icon: 'carbon:user-role',
        },
      },
      {
        name: 'SysMenu',
        path: '/system/menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: {
          title: $t('page.menu.sysMenu'),
          icon: 'material-symbols:menu',
        },
      },
      {
        name: 'SysDataPermission',
        path: '/system/data-permission',
        meta: {
          title: $t('page.menu.sysDataPermission'),
          icon: 'icon-park-outline:permissions',
        },
        children: [
          {
            name: 'SysDataScope',
            path: '/system/data-scope',
            component: () =>
              import('#/views/system/data-permission/scope/index.vue'),
            meta: {
              title: $t('page.menu.sysDataScope'),
              icon: 'cuida:scope-outline',
            },
          },
          {
            name: 'SysDataRule',
            path: '/system/data-rule',
            component: () =>
              import('#/views/system/data-permission/rule/index.vue'),
            meta: {
              title: $t('page.menu.sysDataRule'),
              icon: 'material-symbols:rule',
            },
          },
        ],
      },
      {
        name: 'SysPlugin',
        path: '/system/plugin',
        component: () => import('#/views/system/plugin/index.vue'),
        meta: {
          title: $t('page.menu.sysPlugin'),
          icon: 'clarity:plugin-line',
        },
      },
    ],
  },
];

export default routes;
