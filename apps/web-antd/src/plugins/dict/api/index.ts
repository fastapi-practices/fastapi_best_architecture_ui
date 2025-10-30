import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

export interface DictTypeParams {
  name?: string;
  code?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface DictTypeResult {
  id: number;
  name: string;
  code: string;
  status: number;
  remark?: string;
  created_time: string;
  updated_time?: string;
}

export interface CreateDictTypeParams {
  name: string;
  code: string;
  status: number;
  remark: string;
}

export interface DictDataParams {
  type_id?: number;
  label?: string;
  status?: number;
}

export interface DictDataResult {
  id: number;
  type_id: number;
  label: string;
  value: string;
  color?: string;
  sort: number;
  status: number;
  remark: string;
}

export interface CreateDictDataParams {
  type_id: number;
  label: string;
  value: string;
  sort: number;
  status: number;
  remark?: string;
}

export async function getAllDictTypeApi() {
  return await requestClient.get<DictTypeResult[]>(
    '/api/v1/sys/dict-types/all',
  );
}

export async function getDictTypeListApi(params: DictTypeParams) {
  return await requestClient.get<PaginationResult<DictTypeResult>>(
    '/api/v1/sys/dict-types',
    { params },
  );
}

export async function createDictTypeApi(data: CreateDictTypeParams) {
  return await requestClient.post('/api/v1/sys/dict-types', data);
}

export async function updateDictTypeApi(
  pk: number,
  data: CreateDictTypeParams,
) {
  return await requestClient.put(`/api/v1/sys/dict-types/${pk}`, data);
}

export async function deleteDictTypeApi(pks: number[]) {
  return await requestClient.delete('/api/v1/sys/dict-types', {
    data: { pks },
  });
}

export async function getDictDataDetailApi(code: string) {
  return await requestClient.get<DictDataResult[]>(
    `/api/v1/sys/dict-datas/type-codes/${code}`,
  );
}

export async function getDictDataListApi(params: DictDataParams) {
  return await requestClient.get<PaginationResult<DictDataResult>>(
    '/api/v1/sys/dict-datas',
    { params },
  );
}

export async function createDictDataApi(data: CreateDictDataParams) {
  return await requestClient.post('/api/v1/sys/dict-datas', data);
}

export async function updateDictDataApi(
  pk: number,
  data: CreateDictDataParams,
) {
  return await requestClient.put(`/api/v1/sys/dict-datas/${pk}`, data);
}

export async function deleteDictDataApi(pks: number[]) {
  return await requestClient.delete('/api/v1/sys/dict-datas', {
    data: { pks },
  });
}
