import type { PaginationResult } from '#/types';

import { requestClient } from './request';

export interface LoginLogParams {
  username?: string;
  status?: number;
  ip?: string;
  page?: number;
  size?: number;
}

export interface LoginLogResult {
  id: number;
  username: string;
  status: 0 | 1;
  ip: string;
  country?: string;
  region?: string;
  os?: string;
  browser?: string;
  device?: string;
  msg: string;
  login_time: string;
}

export type OperaLogParams = LoginLogParams;

export interface OperaLogResult {
  id: number;
  trace_id: string;
  username?: string;
  method: string;
  title: string;
  path: string;
  ip: string;
  country?: string;
  os?: string;
  browser?: string;
  device?: string;
  args?: JSON;
  status: 0 | 1;
  code: string;
  msg: string;
  cost_time: number;
  opera_time: string;
}

export function getLoginLogListApi(params: LoginLogParams) {
  return requestClient.get<PaginationResult>('/api/v1/logs/login', { params });
}

export function getOperaLogListApi(params: OperaLogParams) {
  return requestClient.get<PaginationResult>('/api/v1/logs/opera', { params });
}
