import type { AnyFunction } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { OnlineMonitorResult } from '#/api';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';

export const avatarSchema: VbenFormSchema[] = [
  {
    component: 'Textarea',
    fieldName: 'avatar',
    label: '头像链接',
    rules: 'required',
  },
];

export const nicknameSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'nickname',
    label: '昵称',
    rules: 'required',
  },
];

const CODE_LENGTH = 6;
export function phoneSchema(sendCodeFunc: AnyFunction): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'phone',
      label: '手机号',
      rules: z
        .string()
        .min(1, { message: $t('authentication.mobileTip') })
        .refine((v) => /^\d{11}$/.test(v), {
          message: $t('authentication.mobileErrortip'),
        }),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        createText: (countdown: number) => {
          return countdown > 0
            ? $t('authentication.sendText', [countdown])
            : $t('authentication.sendCode');
        },
        handleSendCode: sendCodeFunc,
        placeholder: $t('authentication.code'),
      },
      fieldName: 'captcha',
      label: '验证码',
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
}

export function emailSchema(sendCodeFunc: AnyFunction): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
      rules: z.string().email({ message: '无效的邮箱地址' }),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        createText: (countdown: number) => {
          return countdown > 0
            ? $t('authentication.sendText', [countdown])
            : $t('authentication.sendCode');
        },
        handleSendCode: sendCodeFunc,
        placeholder: $t('authentication.code'),
      },
      fieldName: 'captcha',
      label: '验证码',
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
}

export const passwordSchema: VbenFormSchema[] = [
  {
    component: 'InputPassword',
    fieldName: 'old_password',
    label: '当前密码',
    rules: z
      .string({ message: '请输入当前密码' })
      .min(6, '密码长度不能少于 6 个字符')
      .max(20, '密码长度不能超过 20 个字符'),
  },
  {
    component: 'InputPassword',
    fieldName: 'new_password',
    label: '新密码',
    rules: z
      .string({ message: '请输入新密码' })
      .min(6, '密码长度不能少于 6 个字符')
      .max(20, '密码长度不能超过 20 个字符'),
  },
  {
    component: 'InputPassword',
    fieldName: 'confirm_password',
    label: '确认密码',
    dependencies: {
      rules(values) {
        return z
          .string({ message: '请输入确认密码' })
          .min(6, '密码长度不能少于 6 个字符')
          .max(20, '密码长度不能超过 20 个字符')
          .refine(
            (value) => value === values.new_password,
            '两次密码输出不一致',
          );
      },
      triggerFields: ['new_password', 'confirm_password'],
    },
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<OnlineMonitorResult>,
): VxeGridProps['columns'] {
  return [
    { field: 'ip', title: 'IP 地址' },
    { field: 'os', title: '操作系统' },
    { field: 'browser', title: '浏览器' },
    { field: 'device', title: '设备' },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: '在线', value: 1 },
          { color: 'warning', label: '离线', value: 0 },
        ],
      },
    },
    { field: 'last_login_time', title: '最后登录时间' },
    { field: 'expire_time', title: '过期时间' },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 120,
      cellRender: {
        attrs: {
          nameField: 'nickname',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'delete',
            text: '强制下线',
          },
        ],
      },
    },
  ];
}
