import axios from 'axios';
import { UserState } from '@/store/modules/user/types';
import { MenuItem } from '@/store/modules/app/types';
import { SysDeptRes } from '@/api/dept';
import { SysRoleRes } from '@/api/role';
import qs from 'query-string';

export interface SysUserRes {
  id: number;
  uuid: string;
  avatar?: string;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  status: number;
  is_superuser: boolean;
  is_multi_login: boolean;
  join_time: string;
  last_login_time: string;
  dept_id?: number;
  dept?: SysDeptRes;
  roles: SysRoleRes[];
}

export interface SysUserParams {
  dept?: number;
  username?: string;
  phone?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface SysUserListRes {
  items: SysUserRes[];
  total: number;
}

export interface SysUserRoleReq {
  roles: number[];
}

export interface SysUserAvatarReq {
  url: string;
}

export interface SysUserInfoReq {
  dept_id?: number;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
}

export function getUserInfo(): Promise<UserState> {
  return axios.get('/api/v1/users/me');
}

export function getUserMenuList(): Promise<MenuItem[]> {
  return axios.get('/api/v1/menus/sidebar');
}

export function getUserList(params: SysUserParams): Promise<SysUserListRes> {
  return axios.get('/api/v1/users', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function getUser(username: string): Promise<SysUserRes> {
  return axios.get(`/api/v1/users/${username}`);
}

export function updateUserRole(username: string, data: SysUserRoleReq) {
  return axios.put(`/api/v1/users/${username}/role`, data);
}

export function changeUserStatus(pk: number) {
  return axios.put(`/api/v1/users/${pk}/status`);
}

export function changeUserSuper(pk: number) {
  return axios.put(`/api/v1/users/${pk}/super`);
}

export function changeUserMulti(pk: number) {
  return axios.put(`/api/v1/users/${pk}/multi`);
}

export function updateUserAvatar(username: string, data: SysUserAvatarReq) {
  return axios.put(`/api/v1/users/${username}/avatar`, data);
}

export function updateUser(username: string, data: SysUserInfoReq) {
  return axios.put(`/api/v1/users/${username}`, data);
}

export function deleteUser(username: string) {
  return axios.delete(`/api/v1/users/${username}`);
}
