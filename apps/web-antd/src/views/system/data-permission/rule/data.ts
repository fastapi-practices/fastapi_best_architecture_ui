import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { SysDataRuleResult } from '#/api/data-permission';

import { $t } from '@vben/locales';

import { getSysDataRuleModelColumnsApi } from '#/api/data-permission';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '数据规则名称',
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<SysDataRuleResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'name', title: '规则名称' },
    { field: 'model', title: '模型名称' },
    { field: 'column', title: '列名称' },
    {
      field: 'operator',
      title: '操作符',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'cyan', label: 'OR', value: 1 },
          { color: 'success', label: 'AND', value: 0 },
        ],
      },
      width: 80,
    },
    {
      field: 'expression',
      title: '表达式',
      cellRender: {
        name: 'CellTag',
        options: [
          { label: 'not in', value: 7 },
          { label: 'in', value: 6 },
          { label: '<=', value: 5 },
          { label: '<', value: 4 },
          { label: '>=', value: 3 },
          { label: '>', value: 2 },
          { label: '!=', value: 1 },
          { label: '==', value: 0 },
        ],
      },
      width: 80,
    },
    { field: 'value', title: '规则值' },
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
      width: 120,
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
    },
  ];
}

export const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '规则名称',
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [],
    },
    fieldName: 'model',
    label: '模型',
    rules: 'selectRequired',
  },
  {
    component: 'Select',
    fieldName: 'column',
    label: '字段',
    rules: 'selectRequired',
    dependencies: {
      componentProps: async (values) => {
        if (values.model) {
          const res = await getSysDataRuleModelColumnsApi(values.model);
          return {
            class: 'w-full',
            options: res.map((item) => ({
              label: item.comment,
              value: item.key,
            })),
          };
        }
        return { class: 'w-full' };
      },
      disabled(values) {
        return !values.model;
      },
      triggerFields: ['model'],
    },
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: 'OR', value: 1 },
        { label: 'AND', value: 0 },
      ],
      optionType: 'button',
    },
    defaultValue: 0,
    fieldName: 'operator',
    label: '操作符',
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [
        { label: 'not in', value: 7 },
        { label: 'in', value: 6 },
        { label: '<=', value: 5 },
        { label: '<', value: 4 },
        { label: '>=', value: 3 },
        { label: '>', value: 2 },
        { label: '!=', value: 1 },
        { label: '==', value: 0 },
      ],
    },
    fieldName: 'expression',
    label: '表达式',
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'value',
    label: '规则值',
    rules: 'required',
  },
];
