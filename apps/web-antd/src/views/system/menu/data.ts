import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { SysMenuTreeResult } from '#/api';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';
import { getSysMenuTreeApi } from '#/api';
import { componentKeys } from '#/router/routes';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'title',
    label: '菜单标题',
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
  onActionClick?: OnActionClickFn<SysMenuTreeResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'title',
      title: '标题',
      align: 'left',
      fixed: 'left',
      slots: { default: 'title_default' },
      treeNode: true,
      width: 160,
    },
    {
      field: 'type',
      title: '类型',
      width: 80,
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
    { field: 'sort', title: '排序', width: 50 },
    { field: 'perms', title: '权限标识', align: 'left', width: 160 },
    { field: 'name', title: '菜单名称', align: 'left', width: 180 },
    { field: 'path', title: '路由地址', align: 'left', width: 180 },
    { field: 'component', title: '页面组件', align: 'left', width: 300 },
    {
      field: 'status',
      title: '状态',
      width: 80,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: '正常', value: 1 },
          { color: 'error', label: '停用', value: 0 },
        ],
      },
    },
    { field: 'remark', title: '备注' },
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
            text: '新增子菜单',
          },
          'edit',
          {
            code: 'delete',
            disabled: (row: SysMenuTreeResult) => {
              return row.name === 'System';
            },
          },
        ],
      },
    },
  ];
}

export const schema: VbenFormSchema[] = [
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '目录', value: 0 },
        { label: '菜单', value: 1 },
        { label: '按钮', value: 2 },
        { label: '内嵌', value: 3 },
        { label: '外链', value: 4 },
      ],
      optionType: 'button',
    },
    defaultValue: 1,
    fieldName: 'type',
    formItemClass: 'col-span-2 md:col-span-2',
    label: '菜单类型',
  },
  {
    component: 'Input',
    fieldName: 'title',
    label: '菜单标题',
    rules: 'required',
  },
  {
    component: 'ApiTreeSelect',
    componentProps: {
      allowClear: true,
      api: getSysMenuTreeApi,
      class: 'w-full',
      labelField: 'title',
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'parent_id',
    label: '父级部门',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '菜单名称',
    rules: 'required',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return [0, 1, 3, 4].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'path',
    label: '路由地址',
    rules: z.string().regex(/^\/.*/, { message: '必须以为 "/" 开始' }),
  },
  {
    component: 'InputNumber',
    componentProps: {
      defaultValue: 0,
      min: 0,
      style: { width: '100%' },
    },
    fieldName: 'sort',
    label: '排序',
  },
  {
    component: 'IconPicker',
    dependencies: {
      show: (values) => {
        return [0, 1, 3, 4].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'icon',
    label: '图标',
  },
  {
    component: 'AutoComplete',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      filterOption(input: string, option: { value: string }) {
        return option.value.toLowerCase().includes(input.toLowerCase());
      },
      options: componentKeys.map((v: any) => ({ value: v })),
    },
    dependencies: {
      rules: (values) => {
        return values.type === 1 ? 'required' : null;
      },
      show: (values) => {
        return values.type === 1;
      },
      triggerFields: ['type'],
    },
    fieldName: 'component',
    label: '组件路径',
  },
  {
    component: 'Input',
    dependencies: {
      rules: (values) => {
        return values.type === 2 ? 'required' : null;
      },
      show: (values) => {
        return [1, 2, 3].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'perms',
    label: '权限标识',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return [3, 4].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'link',
    label: '链接地址',
    rules: z.string().url($t('ui.formRules.invalidURL')),
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
    component: 'Switch',
    componentProps: {
      checkedValue: 1,
      unCheckedValue: 0,
    },
    defaultValue: 1,
    dependencies: {
      show: (values) => {
        return values.type !== 2;
      },
      triggerFields: ['type'],
    },
    fieldName: 'display',
    label: '是否显示',
  },
  {
    component: 'Switch',
    componentProps: {
      checkedValue: 1,
      unCheckedValue: 0,
    },
    defaultValue: 1,
    dependencies: {
      show: (values) => {
        return values.type === 1;
      },
      triggerFields: ['type'],
    },
    fieldName: 'cache',
    label: '是否缓存',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    label: '备注',
  },
];
