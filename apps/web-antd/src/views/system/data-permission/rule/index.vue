<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  CreateSysDataRuleParams,
  SysDataRuleResult,
} from '#/api/data-permission';

import { computed, ref } from 'vue';

import { Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createSysDataRuleApi,
  deleteSysDataRuleApi,
  getSysDataRuleListApi,
  getSysDataRuleModelsApi,
  updateSysDataRuleApi,
} from '#/api/data-permission';

import { querySchema, schema, useColumns } from './data';

const dataRuleFormOptions: VbenFormProps = {
  showCollapseButton: false,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const dataRuleGridOptions: VxeTableGridOptions<SysDataRuleResult> = {
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
        return await getSysDataRuleListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: dataRuleFormOptions,
  gridOptions: dataRuleGridOptions,
});

function onActionClick({ code, row }: OnActionClickParams<SysDataRuleResult>) {
  switch (code) {
    case 'delete': {
      deleteSysDataRuleApi([row.id]).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      openAddModal(row, false);
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema,
});

interface formSysDataRuleParams extends CreateSysDataRuleParams {
  id?: number;
}

const formData = ref<formSysDataRuleParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['数据规则'])
    : $t('ui.actionTitle.create', ['数据规则']);
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: false,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CreateSysDataRuleParams>();
      try {
        await (formData.value?.id
          ? updateSysDataRuleApi(formData.value?.id, data)
          : createSysDataRuleApi(data));
        await modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<formSysDataRuleParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(data);
      }
    }
  },
});

const openAddModal = (row: any, isAdd: boolean) => {
  try {
    getSysDataRuleModelsApi().then((res) => {
      formApi.updateSchema([
        {
          componentProps: {
            options: res.map((item) => ({
              label: item,
              value: item,
            })),
          },
          fieldName: 'model',
        },
      ]);
    });
  } catch (error) {
    console.error(error);
  } finally {
    if (isAdd) {
      modalApi.setData(null).open();
    } else {
      modalApi.setData(row).open();
    }
  }
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="openAddModal(null, true)">
          <MaterialSymbolsAdd class="size-5" />
          新增数据规则
        </VbenButton>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
  </Page>
</template>
