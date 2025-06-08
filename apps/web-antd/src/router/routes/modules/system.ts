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
          icon: 'mingcute:department-line',
        },
      },
      {
        name: 'SysUser',
        path: 'sys-user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          title: $t('page.menu.sysUser'),
          icon: 'ant-design:user-outlined',
        },
      },
      {
        name: 'SysRole',
        path: 'sys-role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          title: $t('page.menu.sysRole'),
          icon: 'carbon:user-role',
        },
      },
      {
        name: 'SysMenu',
        path: 'sys-menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: {
          title: $t('page.menu.sysMenu'),
          icon: 'material-symbols:menu',
        },
      },
      {
        name: 'SysDataPermission',
        path: 'sys-data-permission',
        meta: {
          title: $t('page.menu.sysDataPermission'),
          icon: 'icon-park-outline:permissions',
        },
        children: [
          {
            name: 'SysDataScope',
            path: 'sys-data-scope',
            component: () =>
              import('#/views/system/data-permission/scope/index.vue'),
            meta: {
              title: $t('page.menu.sysDataScope'),
              icon: 'cuida:scope-outline',
            },
          },
          {
            name: 'SysDataRule',
            path: 'sys-data-rule',
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
        path: 'sys-plugin',
        component: () => import('#/views/system/plugin/index.vue'),
        meta: {
          title: $t('page.menu.sysPlugin'),
          icon: 'clarity:plugin-line',
        },
      },
      {
        name: 'SysConfig',
        path: 'sys-config',
        component: () => import('#/views/system/config/index.vue'),
        meta: {
          title: $t('page.menu.sysConfig'),
          icon: 'codicon:symbol-parameter',
        },
      },
      {
        name: 'SysDict',
        path: 'sys-dict',
        component: () => import('#/views/system/dict/index.vue'),
        meta: {
          title: $t('page.menu.sysDict'),
          icon: 'fluent-mdl2:dictionary',
        },
      },
      {
        name: 'SysNotice',
        path: 'sys-notice',
        component: () => import('#/views/system/notice/index.vue'),
        meta: {
          title: $t('page.menu.sysNotice'),
          icon: 'fe:notice-push',
        },
      },
    ],
  },
];

export default routes;
