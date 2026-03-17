import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

export interface ApiKeyParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface ApiKeyResult {
  id: number;
  user_id: number;
  name: string;
  key: string;
  status: number;
  remark?: string | null;
  expire_time?: null | string;
  created_time: string;
  updated_time?: null | string;
}

export interface CreateApiKeyParams {
  name: string;
  status: number;
  remark?: string;
  expire_time?: null | string;
}

export interface UpdateApiKeyParams extends CreateApiKeyParams {}

export async function getApiKeyListApi(params: ApiKeyParams) {
  return await requestClient.get<PaginationResult<ApiKeyResult>>(
    '/api/v1/sys/api-keys',
    { params },
  );
}

export async function getApiKeyDetailApi(pk: number) {
  return await requestClient.get<ApiKeyResult>(`/api/v1/sys/api-keys/${pk}`);
}

export async function createApiKeyApi(data: CreateApiKeyParams) {
  return await requestClient.post<ApiKeyResult>('/api/v1/sys/api-keys', data);
}

export async function updateApiKeyApi(pk: number, data: UpdateApiKeyParams) {
  return await requestClient.put(`/api/v1/sys/api-keys/${pk}`, data);
}

export async function updateApiKeyStatusApi(pk: number) {
  return await requestClient.put(`/api/v1/sys/api-keys/${pk}/status`);
}

export async function deleteApiKeyApi(pks: number[]) {
  return await requestClient.delete('/api/v1/sys/api-keys', {
    data: { pks },
  });
}
