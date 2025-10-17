import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type {
  CodeGenBusinessResult,
  CodeGenColumnResult,
} from '#/plugins/code_generator/api';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  getAllCodeGenBusinessApi,
  getAllCodeGenColumnTypeApi,
  getCodeGenDbTableApi,
} from '#/plugins/code_generator/api';
import { DictEnum, getDictOptions } from '#/utils/dict';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'table_name',
    label: '表名称',
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<CodeGenBusinessResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'app_name', title: '应用名称' },
    { field: 'table_name', title: '表名称' },
    { field: 'table_comment', title: '表描述' },
    {
      field: 'doc_comment',
      title: '文档描述',
      titlePrefix: { content: '用于 python 代码类、函数、参数文档' },
    },
    {
      field: 'class_name',
      title: '实体类名',
      titlePrefix: {
        content: '用于 python 代码基础类名',
      },
    },
    {
      field: 'schema_name',
      title: 'Schema 类名',
      titlePrefix: {
        content: '用于 python Schema 代码基础类名',
      },
    },
    {
      field: 'filename',
      title: '文件名',
      titlePrefix: {
        content: '用于 python 代码基础文件名',
      },
    },
    {
      field: 'default_datetime_column',
      title: '默认时间列',
      cellRender: {
        name: 'CellTag',
        // options: [
        //   { color: 'success', label: $t('common.enabled'), value: true },
        //   { color: 'error', label: $t('common.disabled'), value: false },
        // ],
        options: getDictOptions(DictEnum.SYS_CHOOSE),
      },
    },
    { field: 'api_version', title: 'API 版本' },
    {
      field: 'gen_path',
      title: '生成路径',
      titlePrefix: {
        content: '默认生成到 app 根路径，也可以自定义生成路径',
      },
      align: 'left',
    },
    { field: 'remark', title: $t('common.table.mark'), align: 'left' },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 150,
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
          'edit',
          'delete',
        ],
      },
    },
  ];
}

const tableSchemaValue = ref<string>();
export const importSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'app',
    label: '应用名称',
    help: '将代码生成到指定应用下',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'table_schema',
    label: '数据库名',
    help: '当前服务所连接的数据库名',
    rules: 'required',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getCodeGenDbTableApi,
      params: { table_schema: tableSchemaValue },
      afterFetch: (data: { table_comment: string; table_name: string }[]) => {
        return data.map((item: any) => ({
          label: item.table_comment || item.table_name,
          value: item.table_name,
        }));
      },
      class: 'w-full',
    },
    dependencies: {
      disabled: (values) => {
        return !values.table_schema;
      },
      trigger(values) {
        tableSchemaValue.value = values.table_schema;
      },
      triggerFields: ['table_schema'],
    },
    fieldName: 'table_name',
    label: '数据库表名',
    rules: 'required',
  },
];

export const editSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'app_name',
    label: '应用名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'table_name',
    label: '表名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'table_comment',
    label: '表描述',
  },
  {
    component: 'Input',
    fieldName: 'doc_comment',
    label: '文档描述',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'class_name',
    label: '实体类名',
  },
  {
    component: 'Input',
    fieldName: 'schema_name',
    label: 'Schema 类名',
  },
  {
    component: 'Input',
    fieldName: 'filename',
    label: '文件名',
  },
  {
    component: 'Input',
    fieldName: 'api_version',
    label: 'API 版本',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      // options: [
      //   { label: $t('common.enabled'), value: true },
      //   { label: $t('common.disabled'), value: false },
      // ],

      options: getDictOptions(DictEnum.SYS_CHOOSE),
      optionType: 'button',
    },
    fieldName: 'default_datetime_column',
    label: '默认时间列',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'gen_path',
    label: '生成路径',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    label: $t('common.table.mark'),
  },
];

export function useColumnColumns(
  onActionClick?: OnActionClickFn<CodeGenColumnResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    {
      field: 'name',
      title: '名称',
    },
    {
      field: 'is_pk',
      title: '是否主键',
      cellRender: {
        name: 'CellTag',
        // options: [
        //   { color: 'success', label: $t('common.enabled'), value: true },
        //   { color: 'error', label: $t('common.disabled'), value: false },
        // ],

        options: getDictOptions(DictEnum.SYS_CHOOSE),
      },
    },
    {
      field: 'comment',
      title: '描述',
    },
    {
      field: 'type',
      title: 'SQLA 类型',
    },
    {
      field: 'pd_type',
      title: 'Pydantic 类型',
    },
    {
      field: 'default',
      title: '默认值',
    },
    {
      field: 'sort',
      title: '排序',
    },
    {
      field: 'length',
      title: '长度',
    },
    {
      field: 'is_nullable',
      title: '选填',
      cellRender: {
        name: 'CellTag',
        // options: [
        //   { color: 'success', label: $t('common.enabled'), value: true },
        //   { color: 'error', label: $t('common.disabled'), value: false },
        // ],

        options: getDictOptions(DictEnum.SYS_CHOOSE),
      },
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 120,
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

export const columnSchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getAllCodeGenBusinessApi,
      afterFetch: (data: CodeGenBusinessResult[]) => {
        return data.map((item: CodeGenBusinessResult) => ({
          label: item.app_name,
          value: item.id,
        }));
      },
      disabled: true,
      class: 'w-full',
    },
    fieldName: 'gen_business_id',
    label: '所属业务',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '列名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'comment',
    label: '列描述',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getAllCodeGenColumnTypeApi,
      afterFetch: (data: string[]) => {
        return data.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
      class: 'w-full',
    },
    fieldName: 'type',
    label: 'SQLA 列类型',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'default',
    label: '列默认值',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
    },
    fieldName: 'sort',
    label: '列排序',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
    },
    fieldName: 'length',
    label: '列长度',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      // options: [
      //   { label: $t('common.enabled'), value: true },
      //   { label: $t('common.disabled'), value: false },
      // ],

      options: getDictOptions(DictEnum.SYS_CHOOSE),
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'is_pk',
    label: '是否主键',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      // options: [
      //   { label: $t('common.enabled'), value: true },
      //   { label: $t('common.disabled'), value: false },
      // ],
      options: getDictOptions(DictEnum.SYS_CHOOSE),
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'is_nullable',
    label: '是否选填',
    rules: 'required',
  },
];
