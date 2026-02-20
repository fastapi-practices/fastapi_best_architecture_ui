import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { TaskSchedulerResult } from '#/api';

import { h } from 'vue';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';
import { getTaskRegisteredApi } from '#/api';
import { DictEnum, getDictOptions } from '#/utils/dict';

export const CRONTAB_PRESETS = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时整点', value: '0 * * * *' },
  { label: '每天午夜', value: '0 0 * * *' },
  { label: '每天 9:00', value: '0 9 * * *' },
  { label: '工作日 9:00', value: '0 9 * * 1-5' },
  { label: '每15分钟', value: '*/15 * * * *' },
  { label: '每3小时', value: '0 */3 * * *' },
];

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '任务名称',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: getDictOptions(DictEnum.TASK_STRATEGY_TYPE),
    },
    fieldName: 'type',
    label: '策略类型',
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<TaskSchedulerResult>,
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
      title: '任务名称',
      minWidth: 120,
    },
    {
      field: 'task',
      title: 'Celery 任务',
      minWidth: 200,
      showOverflow: true,
    },
    {
      field: 'type',
      title: '策略类型',
      width: 150,
      cellRender: {
        name: 'CellTag',
        options: getDictOptions(DictEnum.TASK_STRATEGY_TYPE),
      },
    },
    {
      field: 'schedule',
      title: '触发策略',
      minWidth: 150,
      slots: { default: 'schedule' },
      titleSuffix: {
        icon: 'vxe-icon-question-circle-fill',
        content:
          'Crontab 表达式：https://docs.celeryq.dev/en/latest/userguide/periodic-tasks.html#crontab-schedules',
      },
    },
    {
      field: 'enabled',
      title: '状态',
      width: 100,
      slots: { default: 'enabled' },
    },
    {
      field: 'total_run_count',
      title: '执行总计',
      width: 100,
      slots: { default: 'total_run_count' },
    },
    {
      field: 'last_run_time',
      title: '最近执行',
      width: 168,
    },
    {
      field: 'execute',
      title: '手动执行',
      align: 'center',
      fixed: 'right',
      width: 80,
      slots: { default: 'execute' },
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 160,
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'log',
            text: '日志',
          },
          'edit',
          'delete',
        ],
      },
    },
  ];
}

export function createSchema(
  onOpenCrontabBuilder: () => void,
): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        // options: [
        //   { label: 'Interval（间隔）', value: 0 },
        //   { label: 'Crontab（计划）', value: 1 },
        // ],
        options: getDictOptions(DictEnum.TASK_STRATEGY_TYPE),
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'type',
      formItemClass: 'col-span-2 md:col-span-2',
      label: '策略类型',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '任务名称',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getTaskRegisteredApi,
        class: 'w-full',
        labelField: 'name',
        valueField: 'task',
        placeholder: 'Celery 任务名称或任务模块化字符串',
      },
      fieldName: 'task',
      label: 'Celery 任务',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'args',
      label: '位置参数',
      help: 'JSON 数组格式，例如：[1, "hello", true]',
      rules: z
        .string()
        .optional()
        .transform((val, ctx) => {
          if (!val || val.trim() === '') return undefined;
          try {
            const parsed = JSON.parse(val);
            if (!Array.isArray(parsed)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '必须是 JSON 数组格式，例如：[1, "hello", true]',
              });
              return z.NEVER;
            }
            return JSON.stringify(parsed);
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: '无效的 JSON 格式，请输入合法的 JSON 数组',
            });
            return z.NEVER;
          }
        }),
    },
    {
      component: 'Textarea',
      fieldName: 'kwargs',
      label: '关键字参数',
      help: 'JSON 对象格式，例如：{"key": "value", "count": 10}',
      rules: z
        .string()
        .optional()
        .transform((val, ctx) => {
          if (!val || val.trim() === '') return undefined;
          try {
            const parsed = JSON.parse(val);
            if (
              Array.isArray(parsed) ||
              typeof parsed !== 'object' ||
              parsed === null
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '必须是 JSON 对象格式，例如：{"key": "value"}',
              });
              return z.NEVER;
            }
            return JSON.stringify(parsed);
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: '无效的 JSON 格式，请输入合法的 JSON 对象',
            });
            return z.NEVER;
          }
        }),
    },
    {
      component: 'Input',
      fieldName: 'queue',
      label: '执行队列',
      help: '将任务下发到指定队列',
    },
    {
      component: 'Input',
      fieldName: 'exchange',
      label: '消息交换机',
      help: '参考：https://docs.celeryq.dev/en/stable/userguide/routing.html#exchanges-queues-and-routing-keys',
    },
    {
      component: 'Input',
      fieldName: 'routing_key',
      label: '路由密钥',
      help: '参考：https://docs.celeryq.dev/en/stable/userguide/routing.html#exchanges-queues-and-routing-keys',
    },
    {
      component: 'DatePicker',
      componentProps: {
        class: 'w-full',
        showTime: true,
      },
      fieldName: 'start_time',
      label: '开始执行时间',
    },
    {
      component: 'DatePicker',
      componentProps: {
        class: 'w-full',
        showTime: true,
      },
      dependencies: {
        disabled: (values) => {
          return !!values.expire_seconds;
        },
        triggerFields: ['expire_seconds'],
      },
      fieldName: 'expire_time',
      label: '过期时间',
      help: '如果任务执行到该时间没有执行完，则取消执行',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
      },
      dependencies: {
        disabled: (values) => {
          return !!values.expire_time;
        },
        triggerFields: ['expire_time'],
      },
      fieldName: 'expire_seconds',
      label: '过期秒数',
      help: '如果任务执行超过该秒后没有执行完，则取消执行',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 1,
      },
      dependencies: {
        show: (values) => {
          return values.type === 0;
        },
        required: (values) => {
          return values.type === 0;
        },
        triggerFields: ['type'],
      },
      fieldName: 'interval_every',
      label: '执行周期',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        options: getDictOptions(DictEnum.TASK_PERIOD_TYPE),
      },
      dependencies: {
        show: (values) => {
          return values.type === 0;
        },
        triggerFields: ['type'],
      },
      defaultValue: 'seconds',
      fieldName: 'interval_period',
      label: '周期类型',
    },
    {
      component: 'Input',
      dependencies: {
        show: (values) => {
          return values.type === 1;
        },
        required: (values) => {
          return values.type === 1;
        },
        triggerFields: ['type'],
      },
      fieldName: 'crontab',
      label: '执行计划',
      rules: z
        .string()
        .optional()
        .refine(
          (val) =>
            !val ||
            val.trim() === '' ||
            /^(?:[\d*/,-]+\s+){4}[\d*/,-]+$/.test(val.trim()),
          {
            message: '无效的 Crontab 表达式',
          },
        ),
      help: 'Crontab 表达式：https://docs.celeryq.dev/en/latest/userguide/periodic-tasks.html#crontab-schedules',
      renderComponentContent: () => ({
        suffix: () =>
          h(
            'span',
            {
              style: 'cursor: default;',
              title: '可视化配置',
              onMousedown: (e: Event) => e.preventDefault(),
              onClick: (e: Event) => {
                e.stopPropagation();
                onOpenCrontabBuilder();
              },
            },
            '⚙',
          ),
      }),
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
      fieldName: 'one_off',
      label: '只执行一次',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
  ];
}
