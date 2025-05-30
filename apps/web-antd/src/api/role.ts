import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from './request';

export interface SysRoleParams {
  name?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface SysRoleResult {
  id: number;
  name: string;
  status: number;
  remark?: string;
  created_time: string;
  updated_time: string;
}

export interface SysAddRoleParams {
  name: string;
  status: number;
  remark?: string;
}

/**
 * 获取系统角色列表
 */
export async function getSysRoleListApi(params: SysRoleParams) {
  return requestClient.get<SysRoleResult>('/api/v1/sys/roles', { params });
}

export async function getAllSysRoleApi() {
  return requestClient.get<SysRoleResult[]>('/api/v1/sys/roles/all');
}

export async function getSysRoleMenuApi(pk: number) {
  return requestClient.get<RouteRecordStringComponent[]>(
    `/api/v1/sys/roles/${pk}/menus`,
  );
}

export async function addSysRoleApi(data: SysAddRoleParams) {
  return requestClient.post('/api/v1/sys/roles', data);
}

export async function updateSysRoleApi(pk: number, data: SysAddRoleParams) {
  return requestClient.put(`/api/v1/sys/roles/${pk}`, data);
}

export async function updateSysRoleMenu(pk: number, menus: number[]) {
  return requestClient.put(`/api/v1/sys/roles/${pk}/menus`, { menus });
}

export async function deleteSysRoleApi(pk: number[]) {
  return requestClient.delete(`/api/v1/sys/roles`, {
    params: { pk },
    paramsSerializer: 'repeat',
  });
}
