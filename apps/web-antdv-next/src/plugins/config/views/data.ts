import type { VbenFormSchema } from '#/adapter/form';

import { h } from 'vue';

import { z } from '#/adapter/form';
import { DictEnum, getDictOptions } from '#/utils/dict';

export const userSecuritySchema: VbenFormSchema[] = [
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
    fieldName: 'USER_SECURITY_CONFIG_STATUS',
    label: '状态',
    help: '默认使用本地配置，当启用时，将使用此配置',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'USER_LOCK_THRESHOLD',
    label: '密码错误锁定阈值',
    description: () =>
      h(
        'div',
        { class: 'text-xs' },
        '用户连续登录失败达到此次数后将被锁定，0 表示禁用锁定',
      ),
    renderComponentContent: () => ({
      suffix: () => '次',
    }),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'USER_LOCK_SECONDS',
    label: '密码错误锁定时长（秒）',
    description: () =>
      h('div', { class: 'text-xs' }, '用户被锁定后自动解锁的时间'),
    renderComponentContent: () => ({
      suffix: () => '秒',
    }),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'USER_PASSWORD_EXPIRY_DAYS',
    label: '密码有效期（天）',
    description: () =>
      h('div', { class: 'text-xs' }, '密码强制修改周期，0 表示永不过期'),
    renderComponentContent: () => ({
      suffix: () => '天',
    }),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'USER_PASSWORD_REMINDER_DAYS',
    label: '密码到期提醒（天）',
    description: () =>
      h(
        'div',
        { class: 'text-xs' },
        '密码到期前多少天提醒用户修改密码，0 表示不提醒',
      ),
    renderComponentContent: () => ({
      suffix: () => '天',
    }),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'USER_PASSWORD_HISTORY_CHECK_COUNT',
    label: '密码历史检查次数',
    description: () =>
      h('div', { class: 'text-xs' }, '新密码不能与最近 N 次使用的密码相同'),
    renderComponentContent: () => ({
      suffix: () => '次',
    }),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'USER_PASSWORD_MIN_LENGTH',
    label: '密码最小长度',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'USER_PASSWORD_MAX_LENGTH',
    label: '密码最大长度',
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
    defaultValue: 'false',
    fieldName: 'USER_PASSWORD_REQUIRE_SPECIAL_CHAR',
    label: '密码必须包含特殊字符',
    labelClass: 'float-left',
    rules: 'required',
  },
];

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
    description: () => h('div', { class: 'text-xs' }, '是否启用登录验证码'),
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
