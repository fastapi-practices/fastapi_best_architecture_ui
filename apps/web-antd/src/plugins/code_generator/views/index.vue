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

import { ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
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
          default_datetime_column: row.default_datetime_column,
        })
        .open();
      break;
    }
    case 'edit': {
      checkedCodeGenBusiness.value = row.id;
      editModalApi.setData(row).open();
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

const [EditForm, editFormApi] = useVbenForm({
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
  showDefaultActions: false,
  schema: editSchema,
});

const checkedCodeGenBusiness = ref<number>(0);

const [EditModal, editModalApi] = useVbenModal({
  class: 'w-5/12',
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await editFormApi.validate();
    if (valid) {
      editModalApi.lock();
      const data = await editFormApi.getValues<CodeGenBusinessParams>();
      try {
        await updateCodeGenBusinessApi(checkedCodeGenBusiness.value, data);
        message.success($t('ui.actionMessage.operationSuccess'));
        await editModalApi.close();
        onRefresh();
      } finally {
        editModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = editModalApi.getData<CodeGenBusinessParams>();
      editFormApi.resetForm();
      if (data) {
        editFormApi.setValues(data);
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
        <VbenButton @click="importModalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          导入
        </VbenButton>
      </template>
    </Grid>
    <ImportModal title="导入表">
      <ImportForm />
    </ImportModal>
    <EditModal title="修改代码生成业务">
      <EditForm />
    </EditModal>
    <Drawer />
  </Page>
</template>
