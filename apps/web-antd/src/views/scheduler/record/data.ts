import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '任务名称',
  },
  {
    component: 'Input',
    fieldName: 'task_id',
    label: '任务 ID',
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
  { field: 'task_id', title: '任务 ID' },
  { field: 'name', title: '任务名称' },
  {
    field: 'args',
    title: '位置参数',
    formatter: ({ cellValue }) =>
      JSON.stringify(cellValue, (_, value) => {
        return value === null ? undefined : value;
      }),
  },
  {
    field: 'kwargs',
    title: '关键字参数',
    formatter: ({ cellValue }) =>
      JSON.stringify(cellValue, (_, value) => {
        return value === null ? undefined : value;
      }),
  },
  { field: 'status', title: '状态' },
  { field: 'result', title: '结果' },
  { field: 'retries', title: '重试次数' },
  { field: 'traceback', title: '错误回溯' },
  { field: 'worker', title: 'Worker' },
  { field: 'queue', title: '队列' },
  { field: 'date_done', title: '结束时间' },
];
