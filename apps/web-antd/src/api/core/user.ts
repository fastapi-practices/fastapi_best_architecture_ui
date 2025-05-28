import type { UserInfo } from '@vben/types';

import type { SysDeptResult, SysRoleResult } from '#/api';

import { requestClient } from '#/api/request';

export interface MyUserInfo extends UserInfo {
  id: number;
  nickname: string;
}

export interface SysUserResult {
  id: number;
  uuid: string;
  dept_id?: number;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: number;
  is_superuser: boolean;
  is_staff: boolean;
  is_multi_login: boolean;
  join_time: string;
  last_login_time: string;
  dept?: SysDeptResult;
  roles: SysRoleResult[];
}

export interface SysUserParams {
  dept?: number;
  username?: string;
  phone?: string;
  status?: number;
  page?: number;
  size?: number;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<MyUserInfo>('/api/v1/sys/users/me');
}

export async function getSysUserListApi(params: SysUserParams) {
  return requestClient.get<SysUserResult>('/api/v1/sys/users', { params });
}

export async function updateSysUserStatusApi(pk: number) {
  return requestClient.put(`/api/v1/sys/users/${pk}/status`);
}

export async function updateSysUserSuperApi(pk: number) {
  return requestClient.put(`/api/v1/sys/users/${pk}/super`);
}

export async function updateSysUserStaffApi(pk: number) {
  return requestClient.put(`/api/v1/sys/users/${pk}/staff`);
}

export async function updateSysUserMultiApi(pk: number) {
  return requestClient.put(`/api/v1/sys/users/${pk}/multi`);
}

export async function deleteSysUserApi(username: string) {
  return requestClient.delete(`/api/v1/sys/users/${username}`);
}
