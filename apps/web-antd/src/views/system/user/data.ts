import type { VbenFormSchema } from '#/adapter/form';
import type {
  OnActionClickFn,
  OnActionClickParams,
  VxeGridProps,
} from '#/adapter/vxe-table';
import type { SysRoleResult, SysUserResult } from '#/api';

import { $t } from '@vben/locales';

import { getSysDeptTreeApi, updateSysUserPermissionApi } from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户名',
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: '手机号',
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
          label: '禁用',
          value: 0,
        },
      ],
      placeholder: $t('common.form.select'),
    },
    fieldName: 'status',
    label: $t('common.form.status'),
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<SysUserResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'username', title: '用户名', width: 100 },
    { field: 'nickname', title: '昵称', width: 100 },
    {
      field: 'avatar',
      title: '头像',
      width: 80,
      slots: { default: 'avatar' },
    },
    {
      field: 'dept',
      title: '部门',
      width: 120,
      slots: { default: 'dept' },
    },
    {
      field: 'roles',
      title: '角色',
      width: 220,
      showOverflow: 'ellipsis',
      slots: { default: 'roles' },
    },
    { field: 'email', title: '邮箱', width: 150 },
    {
      field: 'phone',
      title: '手机号',
      width: 150,
      formatter({ cellValue }) {
        return cellValue || '暂无';
      },
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      cellRender: {
        name: 'CellSwitch',
        attrs: {
          onChange: ({ row }: OnActionClickParams<SysUserResult>) => {
            updateSysUserPermissionApi(row.id, 'status');
          },
        },
      },
    },
    {
      field: 'is_superuser',
      title: '超级管理员',
      width: 100,
      cellRender: {
        name: 'CellSwitch',
        attrs: {
          onChange: ({ row }: OnActionClickParams<SysUserResult>) => {
            updateSysUserPermissionApi(row.id, 'superuser');
          },
        },
        props: {
          checkedValue: true,
          unCheckedValue: false,
        },
      },
    },
    {
      field: 'is_staff',
      title: '后台登录',
      width: 100,
      cellRender: {
        name: 'CellSwitch',
        attrs: {
          onChange: ({ row }: OnActionClickParams<SysUserResult>) => {
            updateSysUserPermissionApi(row.id, 'staff');
          },
        },
        props: {
          checkedValue: true,
          unCheckedValue: false,
        },
      },
    },
    {
      field: 'is_multi_login',
      title: '多端登录',
      width: 100,
      cellRender: {
        name: 'CellSwitch',
        attrs: {
          onChange: ({ row }: OnActionClickParams<SysUserResult>) => {
            updateSysUserPermissionApi(row.id, 'multi_login');
          },
        },
        props: {
          checkedValue: true,
          unCheckedValue: false,
        },
      },
    },
    {
      field: 'join_time',
      title: '注册时间',
      width: 168,
    },
    {
      field: 'last_login_time',
      title: '最后登录时间',
      width: 168,
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 130,
      cellRender: {
        attrs: {
          nameField: 'username',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit',
          {
            code: 'delete',
            disabled: (row: SysUserResult) => {
              return row.username === 'admin';
            },
          },
        ],
      },
    },
  ];
}

export function useEditSchema(roleSelectOptions: any): VbenFormSchema[] {
  return [
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getSysDeptTreeApi,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'dept_id',
      label: '部门',
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: '昵称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'avatar',
      label: '头像地址',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        mode: 'multiple',
        options: roleSelectOptions,
        fieldNames: { label: 'name', value: 'id' },
        filterOption: (input: string, option: SysRoleResult) => {
          return (
            option.name?.toLowerCase()?.includes(input.toLowerCase()) ?? false
          );
        },
      },
      fieldName: 'roles',
      label: '角色',
      rules: 'selectRequired',
    },
  ];
}

export function useAddSchema(roleSelectOptions: any): VbenFormSchema[] {
  return [
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getSysDeptTreeApi,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'dept_id',
      label: '部门',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: '昵称',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        mode: 'multiple',
        options: roleSelectOptions,
        fieldNames: { label: 'name', value: 'id' },
        filterOption: (input: string, option: SysRoleResult) => {
          return (
            option.name?.toLowerCase()?.includes(input.toLowerCase()) ?? false
          );
        },
      },
      fieldName: 'roles',
      label: '角色',
      rules: 'selectRequired',
    },
  ];
}
