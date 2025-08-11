import type { Recordable } from '@vben/types';

import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

export interface QueryCodeGenBusinessParams {
  table_name?: string;
  page?: number;
  size?: number;
}

export interface CodeGenBusinessParams {
  app_name: string;
  table_name: string;
  doc_comment: string;
  table_comment?: string;
  class_name?: string;
  schema_name?: string;
  filename?: string;
  default_datetime_column?: boolean;
  api_version?: string;
  gen_path?: string;
  remark?: string;
}

export interface CodeGenBusinessResult extends CodeGenBusinessParams {
  id: number;
  created_time: string;
  updated_time: string;
}

export interface CodeGenColumnParams {
  name: string;
  comment?: string;
  type: string;
  default?: string;
  sort: number;
  length: number;
  is_pk: boolean;
  is_nullable: boolean;
  gen_business_id: number;
}

export interface CodeGenColumnResult extends CodeGenColumnParams {
  id: number;
  pd_type: string;
}

export interface CodeGenBusinessImportParams {
  app: string;
  table_schema: string;
  table_name: string;
}

export async function getCodeGenBusinessDetailApi(pk: number) {
  return requestClient.get<CodeGenBusinessResult>(
    `/api/v1/generates/businesses/${pk}`,
  );
}

export async function getAllCodeGenBusinessApi() {
  return requestClient.get<CodeGenBusinessResult[]>(
    '/api/v1/generates/businesses/all',
  );
}

export async function createCodeGenBusinessApi(data: CodeGenBusinessParams) {
  return requestClient.post(`/api/v1/generates/businesses`, data);
}

export async function updateCodeGenBusinessApi(
  pk: number,
  data: CodeGenBusinessParams,
) {
  return requestClient.put(`/api/v1/generates/businesses/${pk}`, data);
}

export async function deleteCodeGenBusinessApi(pk: number) {
  return requestClient.delete(`/api/v1/generates/businesses/${pk}`);
}

export async function getCodeGenBusinessListApi(
  params: QueryCodeGenBusinessParams,
) {
  return requestClient.get<PaginationResult<CodeGenBusinessResult>>(
    `/api/v1/generates/businesses`,
    { params },
  );
}

export async function getAllCodeGenBusinessColumnApi(pk: number) {
  return requestClient.get<PaginationResult<CodeGenColumnResult>>(
    `/api/v1/generates/businesses/${pk}/columns`,
  );
}

export async function getAllCodeGenColumnTypeApi() {
  return requestClient.get<string[]>(`/api/v1/generates/columns/types`);
}

export async function getCodeGenColumnDetailApi(pk: number) {
  return requestClient.get(`/api/v1/generates/columns/${pk}`);
}

export async function createCodeGenColumnApi(data: CodeGenColumnParams) {
  return requestClient.post(`/api/v1/generates/columns`, data);
}

export async function updateCodeGenColumnApi(
  pk: number,
  data: CodeGenColumnParams,
) {
  return requestClient.put(`/api/v1/generates/columns/${pk}`, data);
}

export async function deleteCodeGenColumnApi(pk: number) {
  return requestClient.delete(`/api/v1/generates/columns/${pk}`);
}

export async function getCodeGenDbTableApi(params: Recordable<any>) {
  return requestClient.get<string[]>(`/api/v1/generates/codes/tables`, {
    params,
  });
}

export async function importCodeGenDbTableApi(
  data: CodeGenBusinessImportParams,
) {
  return requestClient.post(`/api/v1/generates/codes/imports`, data);
}

export async function previewCodeGenApi(pk: number) {
  return requestClient.get(`/api/v1/generates/codes/${pk}/previews`);
}

export async function getCodeGenPathApi(pk: number) {
  return requestClient.get<string[]>(`/api/v1/generates/codes/${pk}/paths`);
}

export async function generateCodeApi(pk: number) {
  return requestClient.post(`/api/v1/generates/codes/${pk}/generation`);
}

export async function downloadCodeApi(pk: number) {
  return requestClient.download<Blob>(`/api/v1/generates/codes/${pk}`);
}
