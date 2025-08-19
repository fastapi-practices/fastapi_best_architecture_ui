import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface ConfigParams {
  id: string;
  name: string;
  type?: string;
  key: string;
  value: string;
  is_frontend: boolean;
  remark?: string;
}

export interface ConfigResult extends ConfigParams {
  created_time: string;
  updated_time?: string;
}

export async function getAllConfigApi(params: Recordable<any>) {
  return requestClient.get<ConfigResult[]>('/api/v1/sys/configs/all', {
    params,
  });
}

export async function updateConfigApi(params: ConfigParams[]) {
  return requestClient.put('/api/v1/sys/configs', params);
}
