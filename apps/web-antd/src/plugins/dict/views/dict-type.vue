<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  CreateDictTypeParams,
  DictDataResult,
  DictTypeResult,
} from '#/plugins/dict/api';

import { computed, ref } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createDictTypeApi,
  deleteDictTypeApi,
  getDictTypeListApi,
  updateDictTypeApi,
} from '#/plugins/dict/api';
import { emitter } from '#/plugins/dict/views/mitt';

import {
  dictTypeSchema,
  queryDictTypeSchema,
  useDictTypeColumns,
} from './data';

const formOptions: VbenFormProps = {
  wrapperClass: 'md:grid-cols-2',
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: queryDictTypeSchema,
};

const gridOptions: VxeTableGridOptions<DictTypeResult> = {
  rowConfig: {
    keyField: 'id',
    isCurrent: true,
    isHover: true,
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
  columns: useDictTypeColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getDictTypeListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};
const lastDictTypeId = ref<number>(0);
const gridEvents: VxeGridListeners<DictDataResult> = {
  cellClick: ({ row }) => {
    if (lastDictTypeId.value === row.id) {
      return;
    }
    emitter.emit('rowClick', row.id);
    lastDictTypeId.value = row.id;
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});

function onActionClick({ code, row }: OnActionClickParams<DictTypeResult>) {
  switch (code) {
    case 'delete': {
      deleteDictTypeApi([row.id]).then(() => {
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
  }
}

function onRefresh() {
  gridApi.query();
}

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: dictTypeSchema,
});

interface formDictTypeParams extends CreateDictTypeParams {
  id?: number;
}

const formData = ref<formDictTypeParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['字典类型'])
    : $t('ui.actionTitle.create', ['字典类型']);
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CreateDictTypeParams>();
      try {
        await (formData.value?.id
          ? updateDictTypeApi(formData.value?.id, data)
          : createDictTypeApi(data));
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
      const data = modalApi.getData<formDictTypeParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(data);
      }
    }
  },
});
</script>

<template>
  <Grid table-title="字典类型">
    <template #toolbar-tools>
      <VbenButton @click="() => modalApi.setData(null).open()">
        <MaterialSymbolsAdd class="size-5" />
        新增
      </VbenButton>
    </template>
  </Grid>
  <Modal :title="modalTitle">
    <Form />
  </Modal>
</template>
