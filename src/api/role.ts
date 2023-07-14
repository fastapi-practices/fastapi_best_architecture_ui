import { SysMenuRes } from '@/api/menu';
import axios from 'axios';

export interface SysRoleRes {
  id: number;
  name: string;
  data_scope: number;
  status: number;
  remark?: string;
  created_time: string;
  menus?: SysMenuRes[];
}

export function querySysRoleAll(): Promise<SysRoleRes[]> {
  return axios.get('/api/v1/roles/all');
}

export function querySysRoleAllBySysUser(pk: number): Promise<SysRoleRes[]> {
  return axios.get(`/api/v1/roles/${pk}/all`);
}
