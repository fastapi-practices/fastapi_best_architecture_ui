import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { DictEnum, getDictOptions } from '#/utils/dict';

export const emailSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      options: [
        {
          label: 'SMTP',
          value: '0',
        },
      ],
    },
    defaultValue: '0',
    fieldName: 'EMAIL_PROTOCOL',
    label: '邮件协议',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'EMAIL_HOST',
    label: '服务器地址',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    fieldName: 'EMAIL_PORT',
    label: '服务器端口',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'EMAIL_USERNAME',
    label: '邮箱账号',
    rules: z.string().email({ message: '无效的邮箱地址' }),
  },
  {
    component: 'InputPassword',
    fieldName: 'EMAIL_PASSWORD',
    label: '邮箱密码',
    help: '服务授权密码/客户端专用密码',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      // options: [
      //   { label: $t('common.enabled'), value: '1' },
      //   { label: $t('common.disabled'), value: '0' },
      // ],
      options: getDictOptions(DictEnum.SYS_STATUS, { asString: true }),
      optionType: 'button',
    },
    defaultValue: '1',
    fieldName: 'EMAIL_SSL',
    label: 'SSL 加密',
    labelClass: 'float-left',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      // options: [
      //   { label: $t('common.enabled'), value: '1' },
      //   { label: $t('common.disabled'), value: '0' },
      // ],
      options: getDictOptions(DictEnum.SYS_STATUS, { asString: true }),
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'EMAIL_STATUS',
    label: '状态',
    help: '启用时，将覆盖本地配置',
    rules: 'required',
  },
];
