import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { SysNoticeResult } from '#/plugins/notice/api';

import { h } from 'vue';

import { MarkdownEditor } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { DictEnum, getDictOptions } from '#/utils/dict';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'title',
    label: '标题',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      // options: [
      //   {
      //     label: '通知',
      //     value: 0,
      //   },
      //   {
      //     label: '公告',
      //     value: 1,
      //   },
      // ],
      options: getDictOptions(DictEnum.NOTICE),
    },
    fieldName: 'type',
    label: '类型',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      // options: [
      //   {
      //     label: '已启用',
      //     value: 1,
      //   },
      //   {
      //     label: '已停用',
      //     value: 0,
      //   },
      // ],
      options: getDictOptions(DictEnum.SYS_STATUS),
    },
    fieldName: 'status',
    label: $t('common.form.status'),
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<SysNoticeResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'title', title: '标题' },
    {
      field: 'type',
      title: '类型',
      cellRender: {
        name: 'CellTag',
        // options: [
        //   { color: 'success', label: '通知', value: 0 },
        //   { color: 'warning', label: '公告', value: 1 },
        // ],

        options: getDictOptions(DictEnum.NOTICE),
      },
    },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
      },
    },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 168,
    },
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
            code: 'preview',
            text: '预览',
          },
          'edit',
          'delete',
        ],
      },
    },
  ];
}

export const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    formItemClass: 'md:col-span-2',
    fieldName: 'title',
    label: '标题',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    formItemClass: 'col-span-1 md:col-span-1',
    componentProps: {
      buttonStyle: 'solid',
      // options: [
      //   { label: '通知', value: 0 },
      //   { label: '公告', value: 1 },
      // ],

      options: getDictOptions(DictEnum.NOTICE),
      optionType: 'button',
    },
    defaultValue: 0,
    fieldName: 'type',
    label: '类型',
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
    component: h(MarkdownEditor),
    modelPropName: 'value',
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'md:col-span-2',
    fieldName: 'content',
    label: '内容',
    rules: 'required',
  },
];
