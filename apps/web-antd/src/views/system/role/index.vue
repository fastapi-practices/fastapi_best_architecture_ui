<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { CreateSysRoleParams, SysRoleResult } from '#/api';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';
import { traverseTreeValues } from '@vben/utils';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createSysRoleApi,
  deleteSysRoleApi,
  getSysRoleListApi,
  getSysRoleMenuApi,
  updateSysRoleApi,
} from '#/api';

import { querySchema, schema, useColumns } from './data';
import ExtraDrawer from './perm-drawer.vue';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<SysRoleResult> = {
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
        return await getSysRoleListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, girdApi] = useVbenVxeGrid({ formOptions, gridOptions });

function onRefresh() {
  girdApi.query();
}

function onActionClick({ code, row }: OnActionClickParams<SysRoleResult>) {
  switch (code) {
    case 'delete': {
      deleteSysRoleApi([row.id]).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      modalApi.setData(row).open();
      break;
    }
    case 'perm': {
      openDrawer(row.id);
      break;
    }
  }
}

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema,
});

interface formSysRoleParams extends CreateSysRoleParams {
  id?: number;
}

const formData = ref<formSysRoleParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['角色'])
    : $t('ui.actionTitle.create', ['角色']);
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CreateSysRoleParams>();
      try {
        await (formData.value?.id
          ? updateSysRoleApi(formData.value?.id, data)
          : createSysRoleApi(data));
        await modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(idOpen) {
    if (idOpen) {
      const data = modalApi.getData<formSysRoleParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(data);
      }
    }
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: ExtraDrawer,
});

const openDrawer = async (pk: number) => {
  try {
    const roleMenu = await getSysRoleMenuApi(pk);
    drawerApi
      .setData({
        pk,
        checkedRoleMenu: traverseTreeValues(roleMenu, (item: any) => item.id),
      })
      .open();
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          新增角色
        </VbenButton>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
    <Drawer />
  </Page>
</template>
