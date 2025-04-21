import type { SysMenuResult } from '.';

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
  menus?: SysMenuResult[];
}

/**
 * 获取系统角色列表
 */
export async function getSysRoleList(params: SysRoleParams) {
  return requestClient.get<SysRoleResult>('/api/v1/sys/roles', { params });
}
