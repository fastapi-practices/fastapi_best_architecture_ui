import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
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
    label: $t('common.form.status'),
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<SysRoleResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'name', title: '角色名称' },
    {
      field: 'is_filter_scopes',
      title: '过滤数据权限',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: $t('common.enabled'), value: true },
          { color: 'error', label: $t('common.disabled'), value: false },
        ],
      },
    },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
      },
      width: 100,
    },
    { field: 'remark', title: $t('common.table.mark') },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 168,
    },
    {
      field: 'updated_time',
      title: $t('common.table.updated_time'),
      width: 168,
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 200,
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
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
}

export const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '角色名称',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: $t('common.enabled'), value: true },
        { label: $t('common.disabled'), value: false },
      ],
      optionType: 'button',
    },
    defaultValue: true,
    fieldName: 'is_filter_scopes',
    label: '过滤数据权限',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: $t('common.enabled'), value: 1 },
        { label: $t('common.disabled'), value: 0 },
      ],
      optionType: 'button',
    },
    defaultValue: 1,
    fieldName: 'status',
    label: '状态',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    label: '备注',
  },
];

export const drawerQuerySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'title',
    label: '菜单标题',
  },
];

export const drawerColumns: VxeGridProps['columns'] = [
  {
    type: 'checkbox',
    title: '标题',
    align: 'left',
    fixed: 'left',
    treeNode: true,
    minWidth: 150,
  },
  {
    field: 'icon',
    title: '图标',
    slots: { default: 'icon' },
  },
  {
    field: 'type',
    title: '类型',
    cellRender: {
      name: 'CellTag',
      options: [
        { color: 'orange', label: '目录', value: 0 },
        { color: 'default', label: '菜单', value: 1 },
        { color: 'blue', label: '按钮', value: 2 },
        { color: 'warning', label: '内嵌', value: 3 },
        { color: 'success', label: '外链', value: 4 },
      ],
    },
  },
  { field: 'perms', title: '权限标识' },
  { field: 'remark', title: '备注' },
];

export function drawerDataScopeColumns(
  onActionClick?: OnActionClickFn<SysRoleResult>,
): VxeGridProps['columns'] {
  return [
    {
      type: 'checkbox',
      title: '范围名称',
      align: 'left',
      fixed: 'left',
      minWidth: 150,
    },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
      },
      width: 100,
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 200,
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'details',
            text: '规则详情',
          },
        ],
      },
    },
  ];
}

export const drawerDataRuleColumns: VxeGridProps['columns'] = [
  {
    field: 'seq',
    title: $t('common.table.id'),
    type: 'seq',
    width: 50,
  },
  { field: 'name', title: '规则名称' },
];
