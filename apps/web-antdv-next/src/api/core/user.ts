import type { UserInfo } from '@vben/types';

import type { SysDeptResult, SysRoleResult } from '#/api';

import { requestClient } from '#/api/request';

export interface MyUserInfo extends UserInfo {
  id: number;
  nickname: string;
  email?: string;
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
  email?: string;
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
  email?: string;
  phone?: string;
  roles: number[];
}

export interface SysAddUserParams extends SysUpdateUserParams {
  password: string;
}

export interface SysUpdatePasswordParams {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SysUpdateUserPhoneParams {
  phone: string;
  captcha: string;
}

export interface SysUpdateUserEmailParams {
  email: string;
  captcha: string;
}

export interface SysUpdateUserNicknameParams {
  nickname: string;
}

export interface SysUpdateUserAvatarParams {
  avatar: string;
}

export interface SysResetPasswordParams {
  password: string;
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

export async function updateSysUserAvatarApi(data: SysUpdateUserAvatarParams) {
  return requestClient.put(`/api/v1/sys/users/me/avatar`, data);
}

export async function updateSysUserNicknameApi(
  data: SysUpdateUserNicknameParams,
) {
  return requestClient.put(`/api/v1/sys/users/me/nickname`, data);
}
export async function updateSysUserPhoneApi(data: SysUpdateUserPhoneParams) {
  return requestClient.put(`/api/v1/sys/users/me/phone`, data);
}

export async function updateSysUserEmailApi(data: SysUpdateUserEmailParams) {
  return requestClient.put(`/api/v1/sys/users/me/email`, data);
}

export async function updateSysUserPasswordApi(data: SysUpdatePasswordParams) {
  return requestClient.put(`/api/v1/sys/users/me/password`, data);
}

export async function resetSysUserPasswordApi(
  pk: number,
  data: SysResetPasswordParams,
) {
  return requestClient.put(`/api/v1/sys/users/${pk}/password`, data);
}

export async function deleteSysUserApi(pk: number) {
  return requestClient.delete(`/api/v1/sys/users/${pk}`);
}
