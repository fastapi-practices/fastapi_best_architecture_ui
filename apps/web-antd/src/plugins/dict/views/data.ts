import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { DictDataResult, DictTypeResult } from '#/plugins/dict/api';

import { h } from 'vue';

import { $t } from '@vben/locales';

import { Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';
import { getAllDictTypeApi } from '#/plugins/dict/api';
import { DictEnum, getDictOptions } from '#/utils/dict';

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
      // options: [
      //   { label: $t('common.enabled'), value: 1 },
      //   { label: $t('common.disabled'), value: 0 },
      // ],
      options: getDictOptions(DictEnum.SYS_STATUS),
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
    {
      field: 'color',
      title: '标签样式',
      slots: {
        default: ({ row }: { row: any }) => {
          return h(Tag, { color: row.color }, { default: () => row.label });
        },
      },
    },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
      },
    },
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

const COLOR_OPTIONS = [
  { value: 'processing', label: '主要(primary)' },
  { value: 'success', label: '成功(success)' },
  { value: 'error', label: '危险(danger)' },
  { value: 'warning', label: '警告(warning)' },
  { value: 'magenta', label: 'magenta' },
  { value: 'red', label: 'red' },
  { value: 'volcano', label: 'volcano' },
  { value: 'orange', label: 'orange' },
  { value: 'gold', label: 'gold' },
  { value: 'lime', label: 'lime' },
  { value: 'green', label: 'green' },
  { value: 'cyan', label: 'cyan' },
  { value: 'blue', label: 'blue' },
  { value: 'geekblue', label: 'geekblue' },
  { value: 'purple', label: 'purple' },
  { value: 'default', label: '默认(default)' },
  { value: 'pink', label: 'pink' },
];

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
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: COLOR_OPTIONS,
    },
    renderComponentContent: () => ({
      option: ({ value }: { value: any }) => {
        const option = COLOR_OPTIONS.find((opt) => opt.value === value);
        return option
          ? h(
              Tag,
              {
                color: value,
              },
              { default: () => option.label },
            )
          : h(
              Tag,
              {
                color: value,
              },
              { default: () => value },
            );
      },
    }),
    fieldName: 'color',
    label: '标签样式',
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
      // options: [
      //   { label: $t('common.enabled'), value: 1 },
      //   { label: $t('common.disabled'), value: 0 },
      // ],
      options: getDictOptions(DictEnum.SYS_STATUS),
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
