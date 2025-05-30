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
  status: number;
  display: number;
  cache: number;
  remark?: string;
  parent_id?: number;
  created_time: string;
}

export interface SysMenuTreeResult extends SysMenuResult {
  children?: SysMenuTreeResult[];
}

export interface SysMenuParams {
  title: string;
  name: string;
  path?: string;
  parent_id?: number;
  sort?: number;
  icon?: string;
  type?: number;
  component?: string;
  perms?: string;
  status?: number;
  display?: number;
  cache?: number;
  link?: string;
  remark?: string;
}

export interface SysMenuTreeParams {
  title?: string;
  status: number;
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>(
    '/api/v1/sys/menus/sidebar',
  );
}

export async function getSysMenuTreeApi(params: SysMenuTreeParams) {
  return requestClient.get<SysMenuTreeResult>('/api/v1/sys/menus', { params });
}

export async function createSysMenuApi(data: SysMenuParams) {
  return requestClient.post('/api/v1/sys/menus', data);
}

export async function updateSysMenuApi(pk: number, data: SysMenuParams) {
  return requestClient.put(`/api/v1/sys/menus/${pk}`, data);
}

export async function deleteSysMenuApi(pk: number) {
  return requestClient.delete(`/api/v1/sys/menus/${pk}`);
}
