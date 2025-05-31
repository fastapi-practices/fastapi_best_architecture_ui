import { requestClient } from '#/api/request';

export interface SysDataScopesResult {
  id: number;
  name: string;
  status: number;
  created_time: string;
  updated_time: string;
}

export async function getSysDataScopesApi() {
  return requestClient.get<SysDataScopesResult>('/api/v1/sys/data-scopes/all');
}
