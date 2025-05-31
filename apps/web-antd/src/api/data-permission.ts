import { requestClient } from '#/api/request';

export interface SysDataScopesResult {
  id: number;
  name: string;
  status: number;
  created_time: string;
  updated_time: string;
}

export interface SysDataRulesResult {
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

export interface SysDataScopeRulesResult extends SysDataScopesResult {
  rules: SysDataRulesResult[];
}

export async function getSysDataScopesApi() {
  return requestClient.get<SysDataScopesResult>('/api/v1/sys/data-scopes/all');
}

export async function getSysDataRulesApi(pk: number) {
  return requestClient.get<SysDataScopeRulesResult>(
    `/api/v1/sys/data-scopes/${pk}/rules`,
  );
}
