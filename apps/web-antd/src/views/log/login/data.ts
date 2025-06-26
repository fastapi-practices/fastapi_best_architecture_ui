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
          label: '成功',
          value: 1,
        },
        {
          label: '失败',
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
  { field: 'username', title: '用户名' },
  {
    field: 'status',
    title: '状态',
    cellRender: {
      name: 'CellTag',
      options: [
        { color: 'success', label: '成功', value: 1 },
        { color: 'error', label: '失败', value: 0 },
      ],
    },
  },
  { field: 'ip', title: 'IP 地址' },
  { field: 'country', title: '国家' },
  { field: 'region', title: '地区' },
  { field: 'os', title: '操作系统' },
  { field: 'browser', title: '浏览器' },
  { field: 'device', title: '设备' },
  { field: 'msg', title: '消息' },
  { field: 'login_time', title: '登录时间', width: 168 },
  {
    field: 'created_time',
    title: $t('common.table.created_time'),
    width: 168,
  },
];
