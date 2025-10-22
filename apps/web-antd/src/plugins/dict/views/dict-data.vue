<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { CreateDictDataParams, DictDataResult } from '#/plugins/dict/api';

import { computed, ref } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';
import { EmptyIcon, MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createDictDataApi,
  deleteDictDataApi,
  getDictDataListApi,
  updateDictDataApi,
} from '#/plugins/dict/api';
import { emitter } from '#/plugins/dict/views/mitt';

import {
  dictDataSchema,
  queryDictDataSchema,
  useDictDataColumns,
} from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: queryDictDataSchema,
};

const gridOptions: VxeTableGridOptions<DictDataResult> = {
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
  columns: useDictDataColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        if (!dictTypeId.value) {
          return [];
        }

        const params = {
          page: page.currentPage,
          size: page.pageSize,
          type_id: dictTypeId.value,
          ...formValues,
        };

        return await getDictDataListApi(params);
      },
    },
  },
};

const dictTypeId = ref<number>(0);

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function onActionClick({ code, row }: OnActionClickParams<DictDataResult>) {
  switch (code) {
    case 'delete': {
      deleteDictDataApi([row.id]).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.label]),
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
  schema: dictDataSchema,
});

interface formDictDataParams extends CreateDictDataParams {
  id?: number;
}

const formData = ref<formDictDataParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['字典数据'])
    : $t('ui.actionTitle.create', ['字典数据']);
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CreateDictDataParams>();
      try {
        await (formData.value?.id
          ? updateDictDataApi(formData.value?.id, data)
          : createDictDataApi(data));
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
      const data = modalApi.getData<formDictDataParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(data);
      }
    }
  },
});

emitter.on('rowClick', async (value) => {
  dictTypeId.value = value;
  onRefresh();
});
</script>

<template>
  <Grid table-title="字典数据">
    <template #toolbar-tools>
      <VbenButton
        :disabled="dictTypeId === 0"
        @click="() => modalApi.setData({ type_id: dictTypeId }).open()"
      >
        <MaterialSymbolsAdd class="size-5" />
        新增
      </VbenButton>
    </template>
    <template #empty>
      <slot name="empty">
        <EmptyIcon class="mx-auto" />
        <div class="mt-2">点击字典类型行以获取字典数据</div>
      </slot>
    </template>
  </Grid>
  <Modal :title="modalTitle">
    <Form />
  </Modal>
</template>
