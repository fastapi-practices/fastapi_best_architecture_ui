import { requestClient } from './request';

export interface SysDeptResult {
  id: number;
  name: string;
  parent_id: number;
  sort: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: number;
  created_time: string;
}

export interface SysDeptTreeResult extends SysDeptResult {
  children?: SysDeptTreeResult[];
}

export interface SysDeptParams {
  name: string;
  parent_id?: number;
  sort?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: number;
}

export interface SysDeptTreeParams {
  name?: string;
  leader?: string;
  phone?: string;
  status?: number;
}

/**
 * 获取部门树
 */
export async function getSysDeptTreeApi(params: SysDeptTreeParams) {
  return requestClient.get<SysDeptTreeResult[]>('/api/v1/sys/depts', {
    params,
  });
}

/**
 * 获取部门详情
 */
export async function getSysDeptDetailApi(pk: number) {
  return requestClient.get<SysDeptTreeResult>(`/api/v1/sys/depts/${pk}`);
}

/**
 * 创建部门
 */
export async function createSysDeptApi(data: SysDeptParams) {
  return requestClient.post('/api/v1/sys/depts', data);
}

/**
 * 更新部门
 */
export async function updateSysDeptApi(pk: number, data: SysDeptParams) {
  return requestClient.put(`/api/v1/sys/depts/${pk}`, data);
}

/**
 * 删除部门
 */
export async function deleteSysDeptApi(pk: number) {
  return requestClient.delete(`/api/v1/sys/depts/${pk}`);
}
