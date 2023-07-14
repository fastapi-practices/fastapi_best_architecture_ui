import axios from 'axios';
import qs from 'query-string';

export interface SysMenuRes {
  id: number;
  title: string;
  name: string;
  parent_id?: number;
  sort: number;
  icon?: string;
  path?: string;
  menu_type: number;
  component?: string;
  perms?: string;
  status: 0 | 1;
  show: 0 | 1;
  cache: 0 | 1;
  remark?: string;
  created_time: string;
}

export interface SysMenuTreeRes extends SysMenuRes {
  children?: SysMenuTreeRes[];
}

export interface SysMenuReq {
  title: string;
  name: string;
  parent_id?: number;
  sort?: number;
  icon?: string;
  path?: string;
  menu_type?: number;
  component?: string;
  perms?: string;
  status: 0 | 1;
  show: 0 | 1;
  cache: 0 | 1;
  remark?: string;
}

export interface SysMenuTreeParams {
  title?: string;
  status?: number;
}

export function querySysMenuTree(
  params: SysMenuTreeParams
): Promise<SysMenuTreeRes[]> {
  return axios.get('/api/v1/menus', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySysMenuDetail(pk: number): Promise<SysMenuTreeRes> {
  return axios.get(`/api/v1/menus/${pk}`);
}

export function createSysMenu(data: SysMenuReq) {
  return axios.post('/api/v1/menus', data);
}

export function updateSysMenu(pk: number, data: SysMenuReq) {
  return axios.put(`/api/v1/menus/${pk}`, data);
}

export function deleteSysMenu(pk: number) {
  return axios.delete(`/api/v1/menus/${pk}`);
}
