import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { SysDeptTreeResult } from '#/api';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';
import { getSysDeptTreeApi } from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '部门名称',
  },
  {
    component: 'Input',
    fieldName: 'leader',
    label: '负责人',
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: '手机号码',
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
          label: '停用',
          value: 0,
        },
      ],
    },
    fieldName: 'status',
    label: $t('common.form.status'),
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<SysDeptTreeResult>,
): VxeGridProps['columns'] {
  return [
    { field: 'name', title: '名称', align: 'left', treeNode: true },
    { field: 'leader', title: '负责人' },
    { field: 'phone', title: '手机号码' },
    { field: 'email', title: '邮箱' },
    { field: 'sort', title: '排序' },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: '正常', value: 1 },
          { color: 'error', label: '停用', value: 0 },
        ],
      },
    },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 168,
      formatter: 'formatDateTime',
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
            code: 'add',
            text: '新增下级',
          },
          'edit',
          {
            code: 'delete',
            disabled: (row: SysDeptTreeResult) => {
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
    label: '部门名称',
    rules: 'required',
  },
  {
    component: 'ApiTreeSelect',
    componentProps: {
      allowClear: true,
      api: getSysDeptTreeApi,
      class: 'w-full',
      labelField: 'name',
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'parent_id',
    label: '父级部门',
  },
  {
    component: 'Input',
    fieldName: 'leader',
    label: '负责人',
  },
  {
    component: 'Input',
    componentProps: {
      allowClear: true,
    },
    fieldName: 'phone',
    label: '手机号码',
  },
  {
    component: 'Input',
    componentProps: {
      allowClear: true,
    },
    fieldName: 'email',
    label: '邮箱地址',
    rules: z.string().email({ message: '无效的邮箱地址' }).optional(),
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
];
