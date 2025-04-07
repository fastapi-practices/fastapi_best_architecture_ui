import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

export interface SysMenuResult {
  id: number;
  title: string;
  name: string;
  path: string;
  sort: number;
  icon?: string;
  type: number;
  component?: string;
  perms?: string;
  status: 0 | 1;
  display: 0 | 1;
  cache: 0 | 1;
  remark?: string;
  parent_id?: number;
  created_time: string;
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>(
    '/api/v1/sys/menus/sidebar',
  );
}
