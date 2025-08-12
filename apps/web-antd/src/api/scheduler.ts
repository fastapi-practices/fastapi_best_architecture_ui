import type { Dayjs } from 'dayjs';

import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

export interface TaskResultParams {
  name?: string;
  task_id?: string;
  page?: number;
  size?: number;
}

export interface TaskResult {
  id: number;
  task_id: string;
  status: string;
  result?: string;
  date_done?: string;
  traceback?: string;
  name?: string;
  args?: string;
  kwargs?: string;
  worker?: string;
  retries?: number;
  queue?: string;
}

export interface CreateTaskSchedulerParams {
  name: string;
  task: string;
  args?: string;
  kwargs?: string;
  queue?: string;
  exchange?: string;
  routing_key?: string;
  start_time?: Dayjs;
  expire_time?: Dayjs;
  expire_seconds?: number;
  type: number;
  interval_every?: number;
  interval_period?: string;
  crontab: string;
  one_off: boolean;
  remark?: string;
}

export interface TaskSchedulerResult extends CreateTaskSchedulerParams {
  id: number;
  enabled: boolean;
  total_run_count: number;
  last_run_time: string;
  created_time: string;
  updated_time?: string;
}

export async function getTaskResultApi(pk: number) {
  return requestClient.get<TaskResult>(`/api/v1/tasks/results/${pk}`);
}

export async function getTaskResultListApi(params?: TaskResultParams) {
  return requestClient.get<PaginationResult<TaskSchedulerResult>>(
    '/api/v1/tasks/results',
    {
      params,
    },
  );
}

export async function deleteTaskResultApi(pks: number[]) {
  return requestClient.delete('/api/v1/tasks/results', { data: { pks } });
}

export async function getAllTaskSchedulerApi() {
  return requestClient.get<TaskSchedulerResult[]>(
    '/api/v1/tasks/schedulers/all',
  );
}

export async function getTaskSchedulerApi(pk: number) {
  return requestClient.get<TaskSchedulerResult>(
    `/api/v1/tasks/schedulers/${pk}`,
  );
}

export async function createTaskSchedulerApi(data: CreateTaskSchedulerParams) {
  return requestClient.post('/api/v1/tasks/schedulers', data);
}

export async function updateTaskSchedulerApi(
  pk: number,
  data: CreateTaskSchedulerParams,
) {
  return requestClient.put(`/api/v1/tasks/schedulers/${pk}`, data);
}

export async function updateTaskSchedulerStatusApi(pk: number) {
  return requestClient.put(`/api/v1/tasks/schedulers/${pk}/status`);
}

export async function deleteTaskSchedulerApi(pk: number) {
  return requestClient.delete(`/api/v1/tasks/schedulers/${pk}`);
}

export async function executeTaskSchedulerApi(pk: number) {
  return requestClient.post(`/api/v1/tasks/schedulers/${pk}/executions`);
}

export async function getTaskRegisteredApi() {
  return requestClient.get<any[]>('/api/v1/tasks/registered');
}

export async function revokeTaskSchedulerApi(task_id: string) {
  return requestClient.delete(`/api/v1/tasks/${task_id}/cancel`);
}
