import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type {
  WorkflowCategoryResult,
  WorkflowDefinitionResult,
  WorkflowInstanceResult,
  WorkflowMessageResult,
} from '#/plugins/workflow/api';
import type { WorkflowNodeType } from '#/plugins/workflow/types';

import { $t } from '@vben/locales';

export const workflowDefinitionQuerySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '流程名称',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '流程编码',
  },
];

export const workflowCategoryQuerySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '分类名称',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '分类编码',
  },
];

export function useWorkflowCategoryColumns(
  onActionClick?: OnActionClickFn<WorkflowCategoryResult>,
): VxeGridProps['columns'] {
  return [
    { field: 'seq', title: $t('common.table.id'), type: 'seq', width: 50 },
    { field: 'name', title: '分类名称' },
    { field: 'code', title: '分类编码', width: 160 },
    { field: 'sort', title: '排序', width: 100 },
    {
      field: 'status',
      title: '状态',
      width: 120,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'default', label: '停用', value: 0 },
          { color: 'success', label: '启用', value: 1 },
        ],
      },
    },
    { field: 'remark', title: '备注' },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 100,
      cellRender: {
        attrs: { onClick: onActionClick },
        name: 'CellOperation',
        options: ['edit'],
      },
    },
  ];
}

export const workflowCategorySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '分类名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '分类编码',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: '排序',
    defaultValue: 0,
  },
  {
    component: 'RadioGroup',
    fieldName: 'status',
    label: '状态',
    defaultValue: 1,
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 0 },
      ],
    },
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    label: '备注',
  },
];

export const workflowDefinitionBaseSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '流程名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '流程编码',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: '描述',
  },
  {
    component: 'RadioGroup',
    fieldName: 'status',
    label: '状态',
    defaultValue: 0,
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
      options: [
        { label: '草稿', value: 0 },
        { label: '已发布', value: 1 },
        { label: '已停用', value: 2 },
      ],
    },
    rules: 'required',
  },
  {
    component: 'Switch',
    fieldName: 'allow_withdraw',
    label: '允许撤回',
    defaultValue: true,
  },
  {
    component: 'Switch',
    fieldName: 'allow_urge',
    label: '允许催办',
    defaultValue: true,
  },
];

export function createWorkflowDefinitionBaseSchema(
  categoryOptions: Array<{ label: string; value: number }>,
): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'category_id',
      label: '流程分类',
      componentProps: {
        allowClear: true,
        options: categoryOptions,
      },
    },
    ...workflowDefinitionBaseSchema,
  ];
}

export function useWorkflowDefinitionColumns(
  onActionClick?: OnActionClickFn<WorkflowDefinitionResult>,
): VxeGridProps['columns'] {
  return [
    { field: 'seq', title: $t('common.table.id'), type: 'seq', width: 50 },
    { field: 'name', title: '流程名称' },
    { field: 'code', title: '流程编码', width: 180 },
    { field: 'description', title: '描述' },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'default', label: '草稿', value: 0 },
          { color: 'success', label: '已发布', value: 1 },
          { color: 'warning', label: '已停用', value: 2 },
        ],
      },
    },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 180,
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 240,
      cellRender: {
        attrs: { onClick: onActionClick },
        name: 'CellOperation',
        options: [
          { code: 'edit', text: '流程设计' },
          { code: 'form', text: '表单设计' },
          { code: 'start', text: '发起申请' },
        ],
      },
    },
  ];
}

export function workflowNodeTypeLabel(type: WorkflowNodeType) {
  return {
    APPROVER: '审批',
    CC: '抄送',
    CONDITION: '条件',
    END: '结束',
    PARALLEL: '并行',
    START: '开始',
    TRIGGER: '触发器',
  }[type];
}

export function workflowStatusOptions() {
  return [
    { color: 'processing', label: '审批中', value: 'RUNNING' },
    { color: 'success', label: '已通过', value: 'APPROVED' },
    { color: 'error', label: '已拒绝', value: 'REJECTED' },
    { color: 'warning', label: '已撤回', value: 'WITHDRAWN' },
  ];
}

export function workflowFormDataText(
  formData?: null | Record<string, any> | string,
) {
  if (!formData) {
    return '-';
  }
  if (typeof formData === 'string') {
    return formData;
  }
  return JSON.stringify(formData, null, 2);
}

export function workflowStatusLabel(status: string) {
  return (
    workflowStatusOptions().find((item) => item.value === status)?.label ||
    status
  );
}

export function workflowMessageTypeLabel(messageType: string) {
  return (
    {
      APPROVED: '审批通过',
      CC_NOTIFY: '抄送通知',
      PENDING_APPROVAL: '待审批',
      REJECTED: '审批拒绝',
      URGE_NOTIFY: '催办提醒',
      WITHDRAWN: '流程撤回',
    }[messageType] || messageType
  );
}

export function useWorkflowDetailDescriptions(
  instance: WorkflowInstanceResult,
) {
  return [
    { label: '实例编号', value: instance.instance_no },
    { label: '标题', value: instance.title },
    { label: '流程定义ID', value: String(instance.definition_id) },
    { label: '发起人ID', value: String(instance.initiator_id) },
    { label: '状态', value: workflowStatusLabel(instance.status) },
    {
      label: '当前任务ID',
      value: instance.current_task_id ? String(instance.current_task_id) : '-',
    },
    {
      label: '待办数',
      value:
        instance.todo_count !== null && instance.todo_count !== undefined
          ? String(instance.todo_count)
          : '-',
    },
    { label: '备注', value: instance.remark || '-' },
    { label: '创建时间', value: instance.created_time },
    { label: '更新时间', value: instance.updated_time || '-' },
  ];
}

export function buildWorkflowInstanceColumns(
  onActionClick?: OnActionClickFn<WorkflowInstanceResult>,
  actions: Array<'approve' | 'detail' | 'reject'> = [
    'detail',
    'approve',
    'reject',
  ],
): VxeGridProps['columns'] {
  const operationOptions = actions.map((action) => {
    if (action === 'detail') {
      return { code: 'detail', text: '详情' };
    }
    if (action === 'approve') {
      return { code: 'approve', text: '通过' };
    }
    return { code: 'reject', text: '拒绝' };
  });

  return [
    { field: 'seq', title: $t('common.table.id'), type: 'seq', width: 50 },
    { field: 'instance_no', title: '实例编号', width: 180 },
    { field: 'title', title: '标题' },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
        options: workflowStatusOptions(),
      },
    },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 180,
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: actions.length > 1 ? 220 : 120,
      cellRender: {
        attrs: { onClick: onActionClick },
        name: 'CellOperation',
        options: operationOptions,
      },
    },
  ];
}

export function useWorkflowInstanceColumns(
  onActionClick?: OnActionClickFn<WorkflowInstanceResult>,
): VxeGridProps['columns'] {
  return buildWorkflowInstanceColumns(onActionClick, [
    'detail',
    'approve',
    'reject',
  ]);
}

export function useWorkflowApplyColumns(
  onActionClick?: OnActionClickFn<WorkflowInstanceResult>,
): VxeGridProps['columns'] {
  return buildWorkflowInstanceColumns(onActionClick, ['detail']);
}

export function useWorkflowMessageColumns(
  onActionClick?: OnActionClickFn<WorkflowMessageResult>,
): VxeGridProps['columns'] {
  return [
    { field: 'seq', title: $t('common.table.id'), type: 'seq', width: 50 },
    { field: 'title', title: '标题', width: 180 },
    {
      field: 'message_type',
      title: '消息类型',
      width: 120,
      formatter: ({ cellValue }) =>
        workflowMessageTypeLabel(String(cellValue || '')),
    },
    { field: 'content', title: '内容' },
    {
      field: 'is_read',
      title: '已读',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '未读', value: false },
          { color: 'success', label: '已读', value: true },
        ],
      },
    },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 180,
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 180,
      cellRender: {
        attrs: { onClick: onActionClick },
        name: 'CellOperation',
        options: [
          { code: 'detail', text: '查看详情' },
          { code: 'read', text: '标记已读' },
        ],
      },
    },
  ];
}
