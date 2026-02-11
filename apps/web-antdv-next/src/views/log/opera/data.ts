import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { OperaLogResult } from '#/api';

import { $t } from '@vben/locales';

import { DictEnum, getDictOptions } from '#/utils/dict';

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
      // options: [
      //   {
      //     label: '正常',
      //     value: 1,
      //   },
      //   {
      //     label: '异常',
      //     value: 0,
      //   },
      // ],
      options: getDictOptions(DictEnum.SYS_LOGIN_STATUS),
    },
    fieldName: 'status',
    label: $t('common.form.status'),
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<OperaLogResult>,
): VxeGridProps['columns'] {
  return [
    { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'username', title: '用户名' },
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
    },
    { field: 'title', title: '操作标题', align: 'left', width: 200 },
    { field: 'path', title: '请求路径', align: 'left', width: 300 },
    { field: 'browser', title: '浏览器' },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
        // options: [
        //   { color: 'success', label: '成功', value: 1 },
        //   { color: 'error', label: '失败', value: 0 },
        // ],
        options: getDictOptions(DictEnum.SYS_LOGIN_STATUS),
      },
    },
    { field: 'code', title: '状态码' },
    { field: 'cost_time', title: '耗时（ms）' },
    { field: 'opera_time', title: '操作时间' },
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
