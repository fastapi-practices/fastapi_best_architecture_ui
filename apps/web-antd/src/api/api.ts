import type { PaginationResult } from '#/types';

import { requestClient } from './request';

export interface SysApiParams {
  name?: string;
  method?: string;
  path?: string;
  page?: number;
  size?: number;
}

export interface SysApiResult {
  id: number;
  name: string;
  method: string;
  path: string;
  remark?: string;
}

/**
 * 获取系统 API 列表
 */
export function getSysApiList(params: SysApiParams) {
  return requestClient.get<PaginationResult>('/api/v1/sys/apis', { params });
}
