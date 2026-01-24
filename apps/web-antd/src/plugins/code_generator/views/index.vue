<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  CodeGenBusinessImportParams,
  CodeGenBusinessParams,
  CodeGenBusinessResult,
} from '#/plugins/code_generator/api';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createCodeGenBusinessApi,
  deleteCodeGenBusinessApi,
  getCodeGenBusinessListApi,
  importCodeGenDbTableApi,
  updateCodeGenBusinessApi,
} from '#/plugins/code_generator/api';

import ExtraDrawer from './column.vue';
import { editSchema, importSchema, querySchema, useColumns } from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<CodeGenBusinessResult> = {
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
    refresh: true,
    refreshOptions: {
      code: 'query',
    },
    custom: true,
    zoom: true,
  },
  columns: useColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getCodeGenBusinessListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function onActionClick({
  code,
  row,
}: OnActionClickParams<CodeGenBusinessResult>) {
  switch (code) {
    case 'delete': {
      deleteCodeGenBusinessApi(row.id).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.table_name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'details': {
      drawerApi
        .setData({
          pk: row.id,
          datetime_mixin: row.datetime_mixin,
        })
        .open();
      break;
    }
    case 'edit': {
      modalApi.setData(row).open();
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

const [ImportForm, importFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: importSchema,
});

const [ImportModal, importModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await importFormApi.validate();
    if (valid) {
      importModalApi.lock();
      const data = await importFormApi.getValues<CodeGenBusinessImportParams>();
      try {
        await importCodeGenDbTableApi(data);
        message.success($t('ui.actionMessage.operationSuccess'));
        await importModalApi.close();
        onRefresh();
      } finally {
        importModalApi.unlock();
      }
    }
  },
});

const [Form, formApi] = useVbenForm({
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
  showDefaultActions: false,
  schema: editSchema,
});

interface formCodeGenBusinessParams extends CodeGenBusinessParams {
  id?: number;
}

const formData = ref<formCodeGenBusinessParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['代码生成业务'])
    : $t('ui.actionTitle.create', ['代码生成业务']);
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-5/12',
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CodeGenBusinessParams>();
      try {
        await (formData.value?.id
          ? updateCodeGenBusinessApi(formData.value.id, data)
          : createCodeGenBusinessApi(data));
        message.success($t('ui.actionMessage.operationSuccess'));
        await modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<formCodeGenBusinessParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
      } else {
        formData.value = undefined;
      }
    }
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: ExtraDrawer,
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          添加
        </VbenButton>
        <VbenButton
          class="ml-2"
          variant="outline"
          @click="importModalApi.setData(null).open()"
        >
          <MaterialSymbolsAdd class="size-5" />
          导入
        </VbenButton>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
    <ImportModal title="导入表">
      <ImportForm />
    </ImportModal>
    <Drawer />
  </Page>
</template>
