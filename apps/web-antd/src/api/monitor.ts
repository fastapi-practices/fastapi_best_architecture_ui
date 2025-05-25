import { requestClient } from './request';

export interface ServerMonitorResult {
  cpu: Record<string, any>;
  mem: Record<string, any>;
  sys: Record<string, any>;
  disk: Record<string, any>[];
  service: Record<string, any>;
}

export interface RedisMonitorResult {
  info: Record<string, any>;
  stats: Record<string, any>[];
}

export interface OnlineMonitorResult {
  id: number;
  session_uuid: string;
  username: string;
  nickname: string;
  ip: string;
  os: string;
  browser: string;
  device: string;
  status: number;
  last_login_time: string;
  expires_time: number;
}

export interface MonitorOnlineParams {
  username: string;
}

export interface KickOutOnlineParams {
  session_uuid: string;
}

export async function getServerMonitorApi() {
  return requestClient.get<ServerMonitorResult>('/api/v1/monitors/server');
}

export async function getRedisMonitorApi() {
  return requestClient.get<RedisMonitorResult>('/api/v1/monitors/redis');
}

export async function getOnlineMonitorApi(params: MonitorOnlineParams) {
  return requestClient.get<OnlineMonitorResult[]>('/api/v1/monitors/online', {
    params,
  });
}

export async function kickOutOnlineApi(
  pk: number,
  params: KickOutOnlineParams,
) {
  return requestClient.delete(`/api/v1/monitors/online/${pk}`, { params });
}
