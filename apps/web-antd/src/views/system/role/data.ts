import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SysRoleResult } from '#/api';

import { $t } from '@vben/locales';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '角色名称',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [
        {
          label: '已启用',
          value: 1,
        },
        {
          label: '已停用',
          value: 0,
        },
      ],
    },
    fieldName: 'status',
    label: $t('page.form.status'),
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    field: 'seq',
    title: $t('page.table.id'),
    type: 'seq',
    width: 50,
  },
  { field: 'name', title: '角色名称' },
  {
    field: 'status',
    title: '状态',
    cellRender: {
      name: 'CellTag',
    },
    width: 100,
  },
  { field: 'remark', title: $t('page.table.mark') },
  {
    field: 'created_time',
    title: $t('page.table.created_time'),
    width: 168,
  },
  {
    field: 'updated_time',
    title: $t('page.table.updated_time'),
    width: 168,
  },
  {
    field: 'operation',
    title: $t('page.table.operation'),
    align: 'center',
    fixed: 'right',
    width: 200,
    cellRender: {
      attrs: {
        nameField: 'name',
      },
      name: 'CellOperation',
      options: [
        {
          code: 'perm',
          text: '权限设置',
        },
        'edit',
        {
          code: 'delete',
          disabled: (row: SysRoleResult) => {
            return row.id === 1;
          },
        },
      ],
    },
  },
];
