import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { DictDataResult, DictTypeResult } from '#/plugins/dict/api';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';
import { getAllDictTypeApi } from '#/plugins/dict/api';

export const queryDictTypeSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '类型名称',
  },
];

export function useDictTypeColumns(
  onActionClick?: OnActionClickFn<DictTypeResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'name', title: '名称' },
    { field: 'remark', title: $t('common.table.mark'), align: 'left' },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 130,
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
    },
  ];
}

export const dictTypeSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '类型名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '类型编码',
    rules: z.string().regex(/^[A-Z_]+$/i, {
      message: '只能包含英文字母和下划线',
    }),
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

export const queryDictDataSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'label',
    label: '数据标签',
  },
];

export function useDictDataColumns(
  onActionClick?: OnActionClickFn<DictDataResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'label', title: '标签' },
    { field: 'value', title: '值' },
    { field: 'sort', title: '排序' },
    { field: 'remark', title: $t('common.table.mark'), align: 'left' },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 130,
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
    },
  ];
}

export const dictDataSchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    componentProps: {
      api: getAllDictTypeApi,
      class: 'w-full',
      labelField: 'name',
      valueField: 'id',
      disabled: true,
    },
    fieldName: 'type_id',
    label: '字典类型',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'label',
    label: '数据标签',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'value',
    label: '数据值',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
    },
    fieldName: 'sort',
    label: '排序',
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
