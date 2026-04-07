import type {
  WorkflowDefinitionEditorValue,
  WorkflowFlowConfig,
  WorkflowFormConfig,
} from '#/plugins/workflow/types';
import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';
import {
  DEFAULT_WORKFLOW_FLOW_CONFIG,
  DEFAULT_WORKFLOW_FORM_CONFIG,
} from '#/plugins/workflow/types';

export interface WorkflowDefinitionParams {
  name?: string;
  code?: string;
  page?: number;
  size?: number;
}

export interface WorkflowCategoryParams {
  name?: string;
  code?: string;
  page?: number;
  size?: number;
}

export interface WorkflowCategoryResult {
  id: number;
  name: string;
  code: string;
  remark?: null | string;
  sort: number;
  status: number;
  created_time: string;
  updated_time?: null | string;
}

export interface CreateWorkflowCategoryParams {
  name: string;
  code: string;
  remark?: null | string;
  sort: number;
  status: number;
}

export type UpdateWorkflowCategoryParams = CreateWorkflowCategoryParams;

export interface WorkflowDefinitionResult {
  id: number;
  category_id?: null | number;
  category_name?: null | string;
  name: string;
  code: string;
  description?: null | string;
  form_config?: null | WorkflowFormConfig;
  flow_config?: null | WorkflowFlowConfig;
  status: number;
  allow_withdraw: boolean;
  allow_urge: boolean;
  created_time: string;
  updated_time?: null | string;
}

export interface CreateWorkflowDefinitionParams {
  category_id?: null | number;
  name: string;
  code: string;
  description?: null | string;
  form_config?: null | WorkflowFormConfig;
  flow_config?: null | WorkflowFlowConfig;
  status: number;
  allow_withdraw: boolean;
  allow_urge: boolean;
}

export type UpdateWorkflowDefinitionParams = CreateWorkflowDefinitionParams;

export interface WorkflowInstanceResult {
  id: number;
  instance_no: string;
  definition_id: number;
  title: string;
  initiator_id: number;
  status: string;
  current_task_id?: null | number;
  form_data?: null | Record<string, any> | string;
  remark?: null | string;
  todo_count?: null | number;
  allow_withdraw?: boolean | null;
  allow_urge?: boolean | null;
  messages?: WorkflowMessageResult[];
  created_time: string;
  updated_time?: null | string;
}

export interface WorkflowMessageResult {
  id: number;
  receiver_id: number;
  instance_id?: null | number;
  task_id?: null | number;
  message_type: string;
  title: string;
  content: string;
  is_read: boolean;
  created_time: string;
  updated_time?: null | string;
}

export interface WorkflowPreviewFlowItem {
  node_id: string;
  node_type: string;
  label: string;
  assignee_id?: null | number;
  assignee_name?: null | string;
  self_select_options?: number[];
  self_select_option_labels?: Record<number, string>;
}

export interface StartWorkflowInstanceParams {
  definition_id: number;
  title: string;
  form_data: Record<string, any>;
  self_select_assignees?: Record<string, number>;
  remark?: null | string;
}

export interface ApproveWorkflowTaskParams {
  comment?: null | string;
}

export interface RejectWorkflowTaskParams {
  comment?: null | string;
}

function safeParseJson<T>(
  value: null | string | T | undefined,
  fallback: T,
): T {
  if (!value) {
    return fallback;
  }
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function serializeDefinitionPayload(data: CreateWorkflowDefinitionParams) {
  return {
    ...data,
    form_config: JSON.stringify(
      data.form_config ?? DEFAULT_WORKFLOW_FORM_CONFIG,
    ),
    flow_config: JSON.stringify(
      data.flow_config ?? DEFAULT_WORKFLOW_FLOW_CONFIG,
    ),
  };
}

function normalizeConditionNodes(
  flowConfig: WorkflowFlowConfig,
): WorkflowFlowConfig {
  return {
    ...flowConfig,
    nodes: flowConfig.nodes.map((node) => {
      if (node.type !== 'CONDITION') {
        return node;
      }
      const conditionGroup = node.data.conditionGroup ?? {
        operator: 'AND',
        conditions: [
          {
            field: node.data.conditionField ?? '',
            operator: node.data.conditionOperator ?? 'EQ',
            value: node.data.conditionValue ?? '',
          },
        ],
      };
      return {
        ...node,
        data: {
          ...node.data,
          conditionGroup,
        },
      };
    }),
  };
}

function normalizeDefinition(result: {
  allow_urge: boolean;
  allow_withdraw: boolean;
  category_id?: null | number;
  category_name?: null | string;
  code: string;
  created_time: string;
  description?: null | string;
  flow_config?: null | string | WorkflowFlowConfig;
  form_config?: null | string | WorkflowFormConfig;
  id: number;
  name: string;
  status: number;
  updated_time?: null | string;
}): WorkflowDefinitionResult {
  return {
    ...result,
    form_config: safeParseJson(
      result.form_config,
      DEFAULT_WORKFLOW_FORM_CONFIG,
    ),
    flow_config: normalizeConditionNodes(
      safeParseJson(result.flow_config, DEFAULT_WORKFLOW_FLOW_CONFIG),
    ),
  };
}

export function buildWorkflowDefinitionEditorValue(
  detail?: null | Partial<WorkflowDefinitionResult>,
): WorkflowDefinitionEditorValue {
  return {
    category_id: detail?.category_id ?? null,
    name: detail?.name ?? '',
    code: detail?.code ?? '',
    description: detail?.description ?? '',
    status: detail?.status ?? 0,
    allow_withdraw: detail?.allow_withdraw ?? true,
    allow_urge: detail?.allow_urge ?? true,
    flow_config: detail?.flow_config ?? DEFAULT_WORKFLOW_FLOW_CONFIG,
    form_config: detail?.form_config ?? DEFAULT_WORKFLOW_FORM_CONFIG,
  };
}

export async function getWorkflowDefinitionListApi(
  params: WorkflowDefinitionParams,
) {
  const result = await requestClient.get<
    PaginationResult<WorkflowDefinitionResult>
  >('/api/v1/workflow/definition', { params });
  return {
    ...result,
    items: result.items.map((item) => normalizeDefinition(item)),
  };
}

export async function getWorkflowDefinitionAvailableApi(
  params: WorkflowDefinitionParams,
) {
  const result = await requestClient.get<
    PaginationResult<WorkflowDefinitionResult>
  >('/api/v1/workflow/definition/available', { params });
  return {
    ...result,
    items: result.items.map((item) => normalizeDefinition(item)),
  };
}

export async function createWorkflowDefinitionApi(
  data: CreateWorkflowDefinitionParams,
) {
  return await requestClient.post(
    '/api/v1/workflow/definition',
    serializeDefinitionPayload(data),
  );
}

export async function updateWorkflowDefinitionApi(
  pk: number,
  data: UpdateWorkflowDefinitionParams,
) {
  return await requestClient.put(
    `/api/v1/workflow/definition/${pk}`,
    serializeDefinitionPayload(data),
  );
}

export async function getWorkflowCategoryListApi(
  params: WorkflowCategoryParams,
) {
  return await requestClient.get<PaginationResult<WorkflowCategoryResult>>(
    '/api/v1/workflow/category',
    { params },
  );
}

export async function createWorkflowCategoryApi(
  data: CreateWorkflowCategoryParams,
) {
  return await requestClient.post('/api/v1/workflow/category', data);
}

export async function updateWorkflowCategoryApi(
  pk: number,
  data: UpdateWorkflowCategoryParams,
) {
  return await requestClient.put(`/api/v1/workflow/category/${pk}`, data);
}

export async function getWorkflowTodoCountApi() {
  return await requestClient.get<number>(
    '/api/v1/workflow/instance/todo-count',
  );
}

export async function getWorkflowInstanceDetailApi(pk: number) {
  return await requestClient.get<WorkflowInstanceResult>(
    `/api/v1/workflow/instance/${pk}`,
  );
}

export async function getWorkflowDefinitionDetailApi(pk: number) {
  const result = await requestClient.get<WorkflowDefinitionResult>(
    `/api/v1/workflow/definition/${pk}`,
  );
  return normalizeDefinition(result);
}

export async function getWorkflowDefinitionAvailableDetailApi(pk: number) {
  const result = await requestClient.get<WorkflowDefinitionResult>(
    `/api/v1/workflow/definition/available/${pk}`,
  );
  return normalizeDefinition(result);
}

export async function getWorkflowCategoryAllApi() {
  const result = await requestClient.get<
    PaginationResult<WorkflowCategoryResult>
  >('/api/v1/workflow/category', {
    params: {
      page: 1,
      size: 200,
    },
  });
  return result.items;
}

export async function getWorkflowCategoryOptionsApi() {
  const items = await getWorkflowCategoryAllApi();
  return items.map((item) => ({
    label: item.name,
    value: item.id,
  }));
}

export async function getWorkflowInstanceListForApplyApi(params: {
  page?: number;
  size?: number;
}) {
  return await requestClient.get<PaginationResult<WorkflowInstanceResult>>(
    '/api/v1/workflow/instance/my-apply',
    { params },
  );
}

export async function getWorkflowInstanceListForTodoApi(params: {
  page?: number;
  size?: number;
}) {
  return await requestClient.get<PaginationResult<WorkflowInstanceResult>>(
    '/api/v1/workflow/instance/my-todo',
    { params },
  );
}

export async function getWorkflowMyTodoListApi(params: {
  page?: number;
  size?: number;
}) {
  return await getWorkflowInstanceListForTodoApi(params);
}

export async function getWorkflowMyApplyListApi(params: {
  page?: number;
  size?: number;
}) {
  return await getWorkflowInstanceListForApplyApi(params);
}

export async function getWorkflowDefinitionAvailablePreviewFlowApi(
  pk: number,
  formData: Record<string, any>,
  selfSelectAssignees?: Record<string, number>,
) {
  return await requestClient.get<{ items: WorkflowPreviewFlowItem[] }>(
    `/api/v1/workflow/definition/available/${pk}/preview-flow`,
    {
      params: {
        form_data: JSON.stringify({
          ...formData,
          __self_select_assignees__: selfSelectAssignees ?? {},
        }),
      },
    },
  );
}

export async function createWorkflowInstanceApi(
  data: StartWorkflowInstanceParams,
) {
  return await requestClient.post('/api/v1/workflow/instance', data);
}

export async function approveWorkflowTaskApi(
  pk: number,
  data: ApproveWorkflowTaskParams,
) {
  return await requestClient.post(`/api/v1/workflow/task/${pk}/approve`, data);
}

export async function rejectWorkflowTaskApi(
  pk: number,
  data: RejectWorkflowTaskParams,
) {
  return await requestClient.post(`/api/v1/workflow/task/${pk}/reject`, data);
}

export async function withdrawWorkflowInstanceApi(pk: number) {
  return await requestClient.post<WorkflowInstanceResult>(
    `/api/v1/workflow/instance/${pk}/withdraw`,
  );
}

export async function urgeWorkflowInstanceApi(pk: number) {
  return await requestClient.post(`/api/v1/workflow/instance/${pk}/urge`);
}

export async function getWorkflowMessageListApi(params: {
  page?: number;
  size?: number;
}) {
  return await requestClient.get<PaginationResult<WorkflowMessageResult>>(
    '/api/v1/workflow/message',
    { params },
  );
}

export async function getWorkflowUnreadCountApi() {
  return await requestClient.get<number>(
    '/api/v1/workflow/message/unread-count',
  );
}

export async function readWorkflowMessageApi(pk: number) {
  return await requestClient.put(`/api/v1/workflow/message/${pk}/read`);
}
