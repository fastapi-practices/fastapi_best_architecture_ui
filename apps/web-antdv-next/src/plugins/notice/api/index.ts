import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

export interface SysNoticeParams {
  title?: string;
  type?: number;
  status?: number;
  page?: number;
  size?: number;
}

export interface SysNoticeResult {
  id: number;
  title: string;
  type: number;
  status: number;
  content: string;
  created_time: string;
  updated_time?: string;
}

export interface CreateSysNoticeParams {
  title: string;
  type: number;
  status: number;
  content: string;
}

export type UpdateSysNoticeParams = CreateSysNoticeParams;

export async function getNoticeListApi(params: SysNoticeParams) {
  return await requestClient.get<PaginationResult<SysNoticeResult>>(
    '/api/v1/sys/notices',
    { params },
  );
}

export async function getSysNoticeApi(pk: number) {
  return requestClient.get<SysNoticeResult>(`/api/v1/sys/notices/${pk}`);
}

export async function createSysNoticeApi(data: CreateSysNoticeParams) {
  return requestClient.post(`/api/v1/sys/notices`, data);
}

export async function updateSysNoticeApi(
  pk: number,
  data: UpdateSysNoticeParams,
) {
  return requestClient.put(`/api/v1/sys/notices/${pk}`, data);
}

export async function deleteSysNoticeApi(pks: number[]) {
  return requestClient.delete('/api/v1/sys/notices', { data: { pks } });
}
