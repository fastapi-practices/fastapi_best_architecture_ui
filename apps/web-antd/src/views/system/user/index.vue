<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

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

import { ColPage, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createSysUserApi,
  deleteSysUserApi,
  getAllSysRoleApi,
  getSysDeptTreeApi,
  getSysUserListApi,
  updateSysUserApi,
} from '#/api';
import {
  querySchema,
  useAddSchema,
  useColumns,
  useEditSchema,
} from '#/views/system/user/data';

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
const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<SysUserResult> = {
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
  columns: useColumns(onActionClick),
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
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function onRefresh() {
  gridApi.query();
}

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
      editUser.value = row.id;
      editModalApi.setData(row).open();
      break;
    }
  }
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
  schema: useEditSchema(roleSelectOptions),
});

const editUser = ref<number>(0);

const [editModal, editModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      editModalApi.lock();
      const data = await formApi.getValues<SysUpdateUserParams>();
      try {
        await updateSysUserApi(editUser.value, data);
        await editModalApi.close();
        onRefresh();
      } finally {
        editModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = editModalApi.getData<any>();
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
  schema: useAddSchema(roleSelectOptions),
});

const [addModal, addModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await addFormApi.validate();
    if (valid) {
      addModalApi.lock();
      const data = await addFormApi.getValues<SysAddUserParams>();
      try {
        await createSysUserApi(data);
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
    :left-width="20"
    :right-width="80"
  >
    <template #left>
      <div class="bg-card mr-2 h-full overflow-y-auto rounded-[var(--radius)]">
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
          <div class="mb-1">XXX集团</div>
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
          <MaterialSymbolsAdd class="size-5" />
          添加用户
        </VbenButton>
      </template>
      <template #avatar="{ row }">
        <a-avatar :src="row.avatar || preferences.app.defaultAvatar" />
      </template>
      <template #dept="{ row }">
        <span v-if="row.dept">
          <a-tag :key="row.dept.name" color="green">
            {{ row.dept.name }}
          </a-tag>
        </span>
        <span v-else>未绑定</span>
      </template>
      <template #roles="{ row }">
        <span v-if="row.roles.length === 1">
          <a-tag color="purple">
            {{ row.roles[0].name }}
          </a-tag>
        </span>
        <span v-else-if="row.roles.length > 1">
          <a-popover placement="topLeft" :overlay-style="{ maxWidth: '20%' }">
            <template #content>
              <a-tag v-for="role in row.roles" :key="role.name" color="purple">
                {{ role.name }}
              </a-tag>
            </template>
            <a-tag v-for="role in row.roles" :key="role.name" color="purple">
              {{ role.name }}
            </a-tag>
          </a-popover>
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
