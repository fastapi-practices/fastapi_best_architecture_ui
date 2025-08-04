import type { VbenFormSchema } from '#/adapter/form';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';
import { getTaskRegisteredApi } from '#/api';

export const schema: VbenFormSchema[] = [
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: 'Interval（间隔）', value: 0 },
        { label: 'Crontab（计划）', value: 1 },
      ],
      optionType: 'button',
    },
    defaultValue: 0,
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
    help: 'JSON 列表字符串，例如：[1, 2, 3]',
  },
  {
    component: 'Textarea',
    fieldName: 'kwargs',
    label: '关键字参数',
    help: 'JSON 字典字符串，例如：{"a": 1, "b": 2}',
    rules: z
      .string()
      .optional()
      .transform((val, ctx) => {
        if (!val) return null;

        try {
          const parsed = JSON.parse(val);
          return z.record(z.string(), z.unknown()).parse(parsed);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '输入必须是有效的 JSON 字符串',
          });
          return z.NEVER;
        }
      }),
  },
  {
    component: 'Input',
    fieldName: 'queue',
    label: '队列',
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
    label: '开始时间',
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
    label: '截止时间',
    help: '截止时间和截止秒数只能设定一个',
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
    label: '截止秒数',
    help: '截止时间和截止秒数只能设定一个',
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
    label: '间隔周期',
  },
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [
        {
          label: '天',
          value: 'days',
        },
        {
          label: '小时',
          value: 'hours',
        },
        {
          label: '分钟',
          value: 'minutes',
        },
        {
          label: '秒',
          value: 'seconds',
        },
        // {
        //   label: '微秒',
        //   value: 'microseconds',
        // },
      ],
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
    label: '计划',
    help: 'Crontab 表达式：https://docs.celeryq.dev/en/latest/userguide/periodic-tasks.html#crontab-schedules',
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
