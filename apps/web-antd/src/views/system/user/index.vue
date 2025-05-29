<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  SysAddUserParams,
  SysDeptTreeResult,
  SysRoleResult,
  SysUpdateUserParams,
  SysUserResult,
} from '#/api';

import { onMounted, ref } from 'vue';

import { ColPage, useVbenModal, VbenButton, z } from '@vben/common-ui';
import { AddData } from '@vben/icons';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addSysUserApi,
  deleteSysUserApi,
  getAllSysRoleApi,
  getSysDeptTreeApi,
  getSysUserListApi,
  updateSysUserApi,
  updateSysUserMultiApi,
  updateSysUserStaffApi,
  updateSysUserStatusApi,
  updateSysUserSuperApi,
} from '#/api';

/**
 * 左侧
 */
const treeData = ref<SysDeptTreeResult[]>([]);

const fetchDeptTree = async (name: string | undefined) => {
  try {
    treeData.value = await getSysDeptTreeApi({ name });
  } catch (error) {
    console.error(error);
  }
};

const searchDeptValue = ref<string>();
const searchDept = async (searchValue: string | undefined) => {
  await fetchDeptTree(searchValue);
};

/**
 * 右侧
 */
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    submitButtonOptions: {
      content: $t('page.form.query'),
    },
    schema: [
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
          placeholder: $t('page.form.select'),
        },
        fieldName: 'status',
        label: $t('page.form.status'),
      },
    ],
  },
  gridOptions: {
    rowConfig: {
      keyField: 'id',
    },
    checkboxConfig: {
      highlight: true,
    },
    height: 'auto',
    exportConfig: {},
    printConfig: {},
    toolbarConfig: {
      export: true,
      print: true,
      refresh: { code: 'query' },
      custom: true,
      zoom: true,
    },
    tooltipConfig: {
      contentMethod: ({ column, row }) => {
        if (column.field === 'roles' && row.roles.length > 0) {
          return row.roles.map((item) => item.name).join('、');
        }
        return null;
      },
    },
    columns: [
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
        width: 100,
        formatter({ cellValue }) {
          return cellValue.name || '未绑定';
        },
      },
      {
        field: 'roles',
        title: '角色',
        width: 200,
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
        field: 'join_time',
        title: '注册时间',
        width: 168,
      },
      {
        field: 'last_login_time',
        title: '注册时间',
        width: 168,
      },
      {
        field: 'status',
        title: '状态',
        fixed: 'right',
        width: 100,
        cellRender: {
          name: 'CellSwitch',
          attrs: {
            onChange: ({ row }: OnActionClickParams<SysUserResult>) => {
              updateSysUserStatusApi(row.id);
            },
          },
        },
      },
      {
        field: 'is_superuser',
        title: '超级管理员',
        fixed: 'right',
        width: 100,
        cellRender: {
          name: 'CellSwitch',
          attrs: {
            onChange: ({ row }: OnActionClickParams<SysUserResult>) => {
              updateSysUserSuperApi(row.id);
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
        fixed: 'right',
        width: 100,
        cellRender: {
          name: 'CellSwitch',
          attrs: {
            onChange: ({ row }: OnActionClickParams<SysUserResult>) => {
              updateSysUserStaffApi(row.id);
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
        title: '多点登录',
        fixed: 'right',
        width: 100,
        cellRender: {
          name: 'CellSwitch',
          attrs: {
            onChange: ({ row }: OnActionClickParams<SysUserResult>) => {
              updateSysUserMultiApi(row.id);
            },
          },
          props: {
            checkedValue: true,
            unCheckedValue: false,
          },
        },
      },
      {
        field: 'operation',
        title: $t('page.table.operation'),
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
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getSysUserListApi({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<SysUserResult>,
});

function onActionClick({ code, row }: OnActionClickParams<SysUserResult>) {
  switch (code) {
    case 'delete': {
      deleteSysUserApi(row.username).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.username]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      editUser.value = row.username;
      modalApi.setData(row).open();
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

const fetchSysUserListByDept = (selectedKeys: number[]) => {
  try {
    gridApi.query({ dept: selectedKeys[0] });
  } catch (error) {
    console.error(error);
  }
};

const roleSelectOptions = ref<SysRoleResult[]>([]);
const fetchAllSysRole = async () => {
  try {
    roleSelectOptions.value = await getAllSysRoleApi();
  } catch (error) {
    console.error(error);
  }
};

const [EditForm, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: [
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
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
      rules: z.string().email({ message: '无效的邮箱地址' }).optional(),
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: '手机号',
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
  ],
});

const editUser = ref<string>('');

const [editModal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<SysUpdateUserParams>();
      try {
        await updateSysUserApi(editUser.value, data);
        await modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<any>();
      formApi.resetForm();
      if (data) {
        formApi.setValues({
          ...data,
          roles: data.roles?.map((item: SysRoleResult) => item.id) || [],
        });
      }
    }
  },
});

const [AddForm, addFormApi] = useVbenForm({
  showDefaultActions: false,
  schema: [
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
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
      rules: z.string().email({ message: '无效的邮箱地址' }),
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
  ],
});

const [addModal, addModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await addFormApi.validate();
    if (valid) {
      addModalApi.lock();
      const data = await addFormApi.getValues<SysAddUserParams>();
      try {
        await addSysUserApi(data);
        await addModalApi.close();
        onRefresh();
      } finally {
        addModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = addModalApi.getData();
      addFormApi.resetForm();
      if (data) {
        addFormApi.setValues(data);
      }
    }
  },
});

onMounted(() => {
  fetchDeptTree(undefined);
  fetchAllSysRole();
});
</script>

<template>
  <ColPage
    auto-content-height
    :resizable="false"
    :left-width="16"
    :right-width="84"
  >
    <template #left>
      <div class="bg-card mr-2 h-full rounded-[var(--radius)]">
        <div class="mt-1 p-2">
          <a-input-search
            v-model:value="searchDeptValue"
            :placeholder="$t('common.search')"
            size="small"
            enter-button
            @search="searchDept"
          />
        </div>
        <div class="-mt-3 p-3">
          XXX集团
          <a-tree
            v-if="treeData.length > 0"
            :show-line="{ showLeafIcon: false }"
            :tree-data="treeData"
            :field-names="{ title: 'name', key: 'id' }"
            default-expand-all
            @select="fetchSysUserListByDept"
          >
            <template #title="{ name }">
              <span v-if="name.includes(searchDeptValue)">
                {{ name.substring(0, name.indexOf(searchDeptValue)) }}
                <span style="color: #f50">{{ searchDeptValue }}</span>
                {{
                  name.substring(
                    name.indexOf(searchDeptValue) + searchDeptValue?.length,
                  )
                }}
              </span>
              <span v-else>{{ name }}</span>
            </template>
          </a-tree>
        </div>
      </div>
    </template>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => addModalApi.setData(null).open()">
          <AddData class="size-5" />
          添加用户
        </VbenButton>
      </template>
      <template #avatar="{ row }">
        <a-avatar :src="row.avatar || preferences.app.defaultAvatar" />
      </template>
      <template #roles="{ row }">
        <span v-if="row.roles.length > 0">
          <a-tag v-for="role in row.roles" :key="role.name">
            {{ role.name }}
          </a-tag>
        </span>
        <span v-else>未绑定</span>
      </template>
    </Grid>
    <editModal title="修改用户">
      <EditForm />
    </editModal>
    <addModal title="添加用户">
      <AddForm />
    </addModal>
  </ColPage>
</template>
