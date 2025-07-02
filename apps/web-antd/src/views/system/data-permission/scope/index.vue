<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  CreateSysDataScopeParams,
  SysDataRuleResult,
  SysDataScopeResult,
} from '#/api/data-permission';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createSysDataScope,
  deleteSysDataScopeApi,
  getSysDataRulesApi,
  getSysDataScopeListApi,
  getSysDataScopeRulesApi,
  updateSysDataScope,
  updateSysDataScopeRulesApi,
} from '#/api/data-permission';

import { drawerColumns, querySchema, schema, useColumns } from './data';

const formOptions: VbenFormProps = {
  showCollapseButton: false,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<SysDataScopeResult> = {
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
        return await getSysDataScopeListApi({
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

function onActionClick({ code, row }: OnActionClickParams<SysDataScopeResult>) {
  switch (code) {
    case 'delete': {
      deleteSysDataScopeApi([row.id]).then(() => {
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
    case 'rule': {
      getSysDataScopeRulesApi(row.id).then((res) => {
        dataScopeRuleGridApi.setGridOptions({
          checkboxConfig: {
            checkRowKeys: res.rules.map((item) => item.id),
          },
        });
      });
      clickDataScope.value = row.id;
      drawerApi.open();
      break;
    }
  }
}

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema,
});

interface formSysDataScopeParams extends CreateSysDataScopeParams {
  id?: number;
}

const formData = ref<formSysDataScopeParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['数据范围'])
    : $t('ui.actionTitle.create', ['数据范围']);
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CreateSysDataScopeParams>();
      try {
        await (formData.value?.id
          ? updateSysDataScope(formData.value?.id, data)
          : createSysDataScope(data));
        await modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<formSysDataScopeParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(data);
      }
    }
  },
});

const clickDataScope = ref<number>(0);

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  closable: false,
  class: 'w-2/5',
  onConfirm() {
    const checkedRows = dataScopeRuleGridApi.grid.getCheckboxRecords(true);
    updateSysDataScopeRulesApi(
      clickDataScope.value,
      checkedRows.map((item: any) => item.id),
    ).then(() => {
      drawerApi.close();
    });
  },
});

const dataScopeRulesGridOptions: VxeTableGridOptions<SysDataRuleResult> = {
  rowConfig: {
    keyField: 'id',
  },
  height: 'auto',
  virtualYConfig: {
    enabled: true,
    gt: 0,
  },
  checkboxConfig: {
    labelField: 'name',
    highlight: true,
    reserve: true,
    checkRowKeys: [],
  },
  pagerConfig: {
    enabled: false,
  },
  columns: drawerColumns,
  proxyConfig: {
    ajax: {
      query: async () => {
        return await getSysDataRulesApi();
      },
    },
  },
};

const [DataScopeRuleGrid, dataScopeRuleGridApi] = useVbenVxeGrid({
  gridOptions: dataScopeRulesGridOptions,
});
</script>

<template>
  <Page auto-content-height>
    <Grid
      table-title="数据范围"
      table-title-help="数据范围是一种用于定义数据规则集的机制，可将多个数据规则关联绑定至同一数据范围，从而构建支持多条件组合筛选的数据权限体系"
    >
      <template #toolbar-tools>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          新增数据范围
        </VbenButton>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
    <Drawer title="关联数据规则">
      <DataScopeRuleGrid />
    </Drawer>
  </Page>
</template>
