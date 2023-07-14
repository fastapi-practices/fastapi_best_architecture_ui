import { AppRouteRecordRaw } from '@/router/routes/types';
import { DEFAULT_LAYOUT } from '@/router/routes/base';

const SYSTEM: AppRouteRecordRaw = {
  path: '/admin',
  name: 'admin',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.system',
    requiresAuth: true,
    icon: 'icon-settings',
    order: 1,
  },
  children: [
    {
      path: 'sys-user',
      name: 'SysUser',
      component: () => import('@/views/admin/user/index.vue'),
      meta: {
        locale: 'menu.system.sysUser',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'sys-dept',
      name: 'SysDept',
      component: () => import('@/views/admin/dept/index.vue'),
      meta: {
        locale: 'menu.system.sysDept',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'sys-api',
      name: 'SysApi',
      component: () => import('@/views/admin/api/index.vue'),
      meta: {
        locale: 'menu.system.sysApi',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'sys-menu',
      name: 'SysMenu',
      component: () => import('@/views/admin/menu/index.vue'),
      meta: {
        locale: 'menu.system.sysMenu',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default SYSTEM;
