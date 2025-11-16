import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { DictEnum, getDictOptions } from '#/utils/dict';

export const loginSchema: VbenFormSchema[] = [
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
    fieldName: 'LOGIN_CONFIG_STATUS',
    label: '状态',
    help: '默认使用本地配置，当启用时，将使用此配置',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      // options: [
      //   { color: 'success', label: $t('common.enabled'), value: 'true' },
      //   { color: 'error', label: $t('common.disabled'), value: 'false' },
      // ],
      options: getDictOptions(DictEnum.SYS_CHOOSE, { asString: true }),
      optionType: 'button',
    },
    defaultValue: 'true',
    fieldName: 'LOGIN_CAPTCHA_ENABLED',
    label: '验证码开关',
    labelClass: 'float-left',
    rules: 'required',
  },
];

export const emailSchema: VbenFormSchema[] = [
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
    help: '默认使用本地配置，当启用时，将使用此配置',
    rules: 'required',
  },
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
    component: 'RadioGroup',
    componentProps: {
      // options: [
      //   { color: 'success', label: $t('common.enabled'), value: 'true' },
      //   { color: 'error', label: $t('common.disabled'), value: 'false' },
      // ],
      options: getDictOptions(DictEnum.SYS_CHOOSE, { asString: true }),
      optionType: 'button',
    },
    defaultValue: '1',
    fieldName: 'EMAIL_SSL',
    label: 'SSL 加密',
    labelClass: 'float-left',
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
    help: '账号授权密码',
    rules: 'required',
  },
];
