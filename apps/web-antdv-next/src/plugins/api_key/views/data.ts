import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { ApiKeyResult } from '#/plugins/api_key/api';

import type { PropType } from 'vue';

import dayjs from 'dayjs';
import { defineComponent, h } from 'vue';

import { $t } from '@vben/locales';

import { Button } from 'antdv-next';

import { DictEnum, getDictOptions } from '#/utils/dict';

export const EXPIRE_PRESETS = [
  { days: 7, label: '7天' },
  { days: 30, label: '1个月' },
  { days: 90, label: '3个月' },
  { days: 180, label: '6个月' },
] as const;

const ExpirePresetActions = defineComponent({
  name: 'ExpirePresetActions',
  props: {
    onApply: {
      required: true,
      type: Function as PropType<(days: number) => void>,
    },
  },
  setup(props) {
    return () =>
      h(
        'div',
        { class: 'flex flex-wrap gap-2' },
        EXPIRE_PRESETS.map((preset) =>
          h(
            Button,
            {
              size: 'small',
              type: 'dashed',
              onClick: () => props.onApply?.(preset.days),
            },
            () => preset.label,
          ),
        ),
      );
  },
});

export function useColumns(
  canEdit: boolean,
  canDelete: boolean,
  onActionClick?: OnActionClickFn<ApiKeyResult>,
  onStatusChange?: (status: number, row: ApiKeyResult) => Promise<boolean>,
): VxeGridProps['columns'] {
  const operationOptions: Array<'delete' | 'edit'> = [];

  if (canEdit) {
    operationOptions.push('edit');
  }
  if (canDelete) {
    operationOptions.push('delete');
  }

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
      minWidth: 160,
    },
    {
      field: 'key',
      title: '令牌',
      minWidth: 220,
      align: 'center',
      showOverflow: 'tooltip',
      slots: {
        default: 'key',
      },
    },
    {
      field: 'status',
      title: '状态',
      width: 110,
      cellRender: {
        name: 'CellSwitch',
        attrs: {
          beforeChange: onStatusChange,
        },
        props: {
          disabled: !canEdit,
        },
      },
    },
    {
      field: 'expire_time',
      title: '过期时间',
      width: 180,
      formatter({ cellValue }) {
        return cellValue
          ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
          : '永不过期';
      },
    },
    {
      field: 'remark',
      title: $t('common.table.mark'),
      minWidth: 180,
      align: 'left',
      showOverflow: 'tooltip',
      formatter({ cellValue }) {
        return cellValue || '-';
      },
    },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 180,
      formatter({ cellValue }) {
        return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
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
        options: operationOptions,
      },
    },
  ];
}

export function useApiKeySchema(
  onApplyExpirePreset: (days: number) => void,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      rules: 'required',
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: '是',
        unCheckedChildren: '否',
      },
      defaultValue: true,
      fieldName: 'never_expires',
      label: '永不过期',
    },
    {
      component: ExpirePresetActions,
      componentProps: {
        onApply: onApplyExpirePreset,
      },
      dependencies: {
        show: (values) => !values.never_expires,
        triggerFields: ['never_expires'],
      },
      fieldName: 'expire_time_presets',
      formItemClass: '-mt-2 mb-1',
      hideLabel: true,
    },
    {
      component: 'DatePicker',
      componentProps: {
        class: 'w-full',
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: '请选择过期时间',
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      dependencies: {
        required: (values) => !values.never_expires,
        show: (values) => !values.never_expires,
        triggerFields: ['never_expires'],
      },
      fieldName: 'expire_time',
      label: '过期时间',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
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
}
