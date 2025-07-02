import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户名',
  },
  {
    component: 'Input',
    fieldName: 'ip',
    label: 'IP 地址',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [
        {
          label: '正常',
          value: 1,
        },
        {
          label: '异常',
          value: 0,
        },
      ],
    },
    fieldName: 'status',
    label: $t('common.form.status'),
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
  {
    field: 'seq',
    title: $t('common.table.id'),
    type: 'seq',
    width: 50,
  },
  { field: 'trace_id', title: '追踪 ID', width: 250 },
  { field: 'username', title: '用户名', width: 100 },
  {
    field: 'method',
    title: '请求方法',
    cellRender: {
      name: 'CellTag',
      options: [
        { color: 'processing', label: 'GET', value: 'GET' },
        { color: 'success', label: 'POST', value: 'POST' },
        { color: 'cyan', label: 'PUT', value: 'PUT' },
        { color: 'error', label: 'PUT', value: 'DELETE' },
      ],
    },
    width: 100,
  },
  { field: 'title', title: '操作标题', width: 150 },
  { field: 'path', title: '请求路径', width: 150 },
  {
    field: 'status',
    title: '状态',
    cellRender: {
      name: 'CellTag',
      options: [
        { color: 'success', label: '正常', value: 1 },
        { color: 'error', label: '异常', value: 0 },
      ],
    },
    width: 80,
  },
  { field: 'ip', title: 'IP 地址', width: 100 },
  { field: 'country', title: '国家', width: 100 },
  { field: 'os', title: '操作系统', width: 150 },
  { field: 'browser', title: '浏览器', width: 130 },
  { field: 'device', title: '设备', width: 80 },
  { field: 'code', title: '状态码', width: 80 },
  { field: 'cost_time', title: '耗时（ms）', width: 100 },
  { field: 'msg', title: '消息', width: 150 },
  {
    field: 'args',
    title: '请求参数',
    formatter: ({ cellValue }) => JSON.stringify(cellValue, null, 2),
    width: 150,
  },
  { field: 'opera_time', title: '操作时间', width: 168 },
];
