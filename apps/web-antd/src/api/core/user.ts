import type { UserInfo } from '@vben/types';

import type { SysDeptResult, SysRoleResult } from '#/api';

import { requestClient } from '#/api/request';

export interface MyUserInfo extends UserInfo {
  id: number;
  nickname: string;
  email: string;
  phone?: string;
  dept?: string;
  last_login_time: string;
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

export interface SysUpdateUserParams {
  dept_id?: number;
  username: string;
  nickname: string;
  avatar?: string;
  email: string;
  phone?: string;
  roles: number[];
}

export interface SysAddUserParams {
  dept_id?: number;
  username: string;
  nickname: string;
  password: string;
  email: string;
  roles: number[];
}

export interface SysResetPasswordParams {
  old_password: string;
  new_password: string;
  confirm_password: string;
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

export async function createSysUserApi(data: SysAddUserParams) {
  return requestClient.post('/api/v1/sys/users', data);
}

export async function updateSysUserApi(pk: number, data: SysUpdateUserParams) {
  return requestClient.put(`/api/v1/sys/users/${pk}`, data);
}

export async function updateSysUserPermissionApi(pk: number, type: string) {
  return requestClient.put(`/api/v1/sys/users/${pk}/permissions`, undefined, {
    params: { type },
    paramsSerializer: 'repeat',
  });
}

export async function updateSysUserPasswordApi(
  pk: number,
  data: SysResetPasswordParams,
) {
  return requestClient.put(`/api/v1/sys/users/${pk}/password`, data);
}

export async function deleteSysUserApi(username: string) {
  return requestClient.delete(`/api/v1/sys/users/${username}`);
}
