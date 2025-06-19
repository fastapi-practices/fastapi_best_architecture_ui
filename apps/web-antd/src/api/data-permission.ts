import { requestClient } from '#/api/request';

export interface SysDataScopeResult {
  id: number;
  name: string;
  status: number;
  created_time: string;
  updated_time: string;
}

export interface SysDataRuleResult {
  id: number;
  name: string;
  model: string;
  column: string;
  operator: string;
  expression: string;
  value: string;
  created_time: string;
  updated_time: string;
}

export interface SysDataScopeParams {
  name?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface CreateSysDataScopeParams {
  name: string;
  status: number;
}

export interface SysDataScopeRulesResult extends SysDataScopeResult {
  rules: SysDataRuleResult[];
}

export interface SysDataRuleParams {
  name?: string;
}

export interface SysDataRuleModelColumnsResult {
  key: string;
  comment: string;
}

export interface CreateSysDataRuleParams {
  name: string;
  model: string;
  column: string;
  operator: string;
  expression: string;
  value: string;
}

export async function getSysDataScopeListApi(params: SysDataScopeParams) {
  return requestClient.get<SysDataScopeResult[]>('/api/v1/sys/data-scopes', {
    params,
  });
}

export async function getSysDataScopesApi() {
  return requestClient.get<SysDataScopeResult[]>('/api/v1/sys/data-scopes/all');
}

export async function getSysDataScopeRulesApi(pk: number) {
  return requestClient.get<SysDataScopeRulesResult>(
    `/api/v1/sys/data-scopes/${pk}/rules`,
  );
}

export async function createSysDataScope(data: CreateSysDataScopeParams) {
  return requestClient.post('/api/v1/sys/data-scopes', data);
}

export async function updateSysDataScope(
  pk: number,
  data: CreateSysDataScopeParams,
) {
  return requestClient.put(`/api/v1/sys/data-scopes/${pk}`, data);
}

export async function updateSysDataScopeRulesApi(pk: number, rules: number[]) {
  return requestClient.put(`/api/v1/sys/data-scopes/${pk}/rules`, { rules });
}

export async function deleteSysDataScopeApi(pks: number[]) {
  return requestClient.delete(`/api/v1/sys/data-scopes`, { data: { pks } });
}

export async function getSysDataRuleListApi(params: SysDataRuleParams) {
  return requestClient.get<SysDataRuleResult[]>('/api/v1/sys/data-rules', {
    params,
  });
}

export async function getSysDataRulesApi() {
  return requestClient.get<SysDataRuleResult[]>('/api/v1/sys/data-rules/all');
}

export async function getSysDataRuleModelsApi() {
  return requestClient.get<string[]>('/api/v1/sys/data-rules/models');
}

export async function getSysDataRuleModelColumnsApi(model: string) {
  return requestClient.get<SysDataRuleModelColumnsResult[]>(
    `/api/v1/sys/data-rules/models/${model}/columns`,
  );
}

export async function createSysDataRuleApi(data: CreateSysDataRuleParams) {
  return requestClient.post('/api/v1/sys/data-rules', data);
}

export async function updateSysDataRuleApi(
  pk: number,
  data: CreateSysDataRuleParams,
) {
  return requestClient.put(`/api/v1/sys/data-rules/${pk}`, data);
}

export async function deleteSysDataRuleApi(pks: number[]) {
  return requestClient.delete(`/api/v1/sys/data-rules`, { data: { pks } });
}
