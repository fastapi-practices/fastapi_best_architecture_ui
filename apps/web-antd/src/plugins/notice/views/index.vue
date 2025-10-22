<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  CreateSysNoticeParams,
  SysNoticeResult,
  UpdateSysNoticeParams,
} from '#/plugins/notice/api';

import { computed, ref } from 'vue';

import {
  MarkdownPreviewer,
  Page,
  useVbenModal,
  VbenButton,
} from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createSysNoticeApi,
  deleteSysNoticeApi,
  getNoticeListApi,
  updateSysNoticeApi,
} from '#/plugins/notice/api';

import { querySchema, schema, useColumns } from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<SysNoticeResult> = {
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
        return await getNoticeListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function onActionClick({ code, row }: OnActionClickParams<SysNoticeResult>) {
  switch (code) {
    case 'delete': {
      deleteSysNoticeApi([row.id]).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.title]),
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
    case 'preview': {
      previewModalApi.setData(row).open();
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

const [Form, formApi] = useVbenForm({
  wrapperClass: 'md:grid-cols-2',
  layout: 'vertical',
  showDefaultActions: false,
  schema,
});

interface formSysNoticeParams extends UpdateSysNoticeParams {
  id?: number;
}

const formData = ref<formSysNoticeParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['角色'])
    : $t('ui.actionTitle.create', ['角色']);
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  class: 'w-5/12',
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CreateSysNoticeParams>();
      try {
        await (formData.value?.id
          ? updateSysNoticeApi(formData.value?.id, data)
          : createSysNoticeApi(data));
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
      const data = modalApi.getData<formSysNoticeParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(data);
      }
    }
  },
});

const preViewTitle = ref<string>('');
const preViewContent = ref<string>('');

const [PreviewModal, previewModalApi] = useVbenModal({
  title: '通知公告预览',
  class: 'w-5/12',
  footer: false,
  onOpenChange: (isOpen) => {
    if (isOpen) {
      const data = previewModalApi.getData<formSysNoticeParams>();
      if (data) {
        preViewTitle.value = data.title;
        preViewContent.value = data.content;
      }
    }
  },
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          新增通知公告
        </VbenButton>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
    <PreviewModal>
      <div class="mb-5 text-center text-3xl">{{ preViewTitle }}</div>
      <MarkdownPreviewer :value="preViewContent" />
    </PreviewModal>
  </Page>
</template>
