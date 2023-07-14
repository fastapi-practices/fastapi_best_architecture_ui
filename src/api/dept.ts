import axios from 'axios';
import qs from 'query-string';

export interface SysDeptRes {
  id: number;
  name: string;
  sort: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: 0 | 1;
  created_time: string;
}

export interface SysDeptTreeRes extends SysDeptRes {
  children?: SysDeptTreeRes[];
}

export interface SysDeptReq {
  name: string;
  parent_id?: number;
  sort?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: 0 | 1;
}

export interface SysDeptTreeParams {
  name?: string;
  leader?: string;
  phone?: string;
  email?: string;
}

export function querySysDeptTree(
  params: SysDeptTreeParams
): Promise<SysDeptTreeRes[]> {
  return axios.get('/api/v1/depts', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySysDeptDetail(pk: number): Promise<SysDeptTreeRes> {
  return axios.get(`/api/v1/depts/${pk}`);
}

export function createSysDept(data: SysDeptReq) {
  return axios.post('/api/v1/depts', data);
}

export function updateSysDept(pk: number, data: SysDeptReq) {
  return axios.put(`/api/v1/depts/${pk}`, data);
}

export function deleteSysDept(pk: number) {
  return axios.delete(`/api/v1/depts/${pk}`);
}
