import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { TaskResult } from '#/api';

import { $t } from '@vben/locales';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'task_id',
    label: '任务 ID',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '任务名称',
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<TaskResult>,
): VxeGridProps['columns'] {
  return [
    { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
    {
      field: 'task_id',
      title: '任务 ID',
      minWidth: 200,
      showOverflow: true,
    },
    { field: 'name', title: '任务名称' },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: 'SUCCESS', value: 'SUCCESS' },
          { color: 'error', label: 'FAILURE', value: 'FAILURE' },
          { color: 'processing', label: 'PENDING', value: 'PENDING' },
          { color: 'processing', label: 'STARTED', value: 'STARTED' },
          { color: 'warning', label: 'RETRY', value: 'RETRY' },
          { color: 'default', label: 'REVOKED', value: 'REVOKED' },
        ],
      },
    },
    {
      field: 'result',
      title: '结果',
      showOverflow: true,
    },
    { field: 'retries', title: '重试次数' },
    { field: 'date_done', title: '结束时间', width: 168 },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 100,
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'details',
            text: '详情',
          },
        ],
      },
    },
  ];
}
