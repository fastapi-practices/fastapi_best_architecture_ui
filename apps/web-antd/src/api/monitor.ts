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

export function getServerMonitor() {
  return requestClient.get<ServerMonitorResult>('/api/v1/monitors/server');
}

export function getRedisMonitor() {
  return requestClient.get<RedisMonitorResult>('/api/v1/monitors/redis');
}
