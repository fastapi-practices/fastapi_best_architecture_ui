<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { ApiKeyResult, CreateApiKeyParams } from '#/plugins/api_key/api';

import { computed, ref, watch } from 'vue';

import { useAccess } from '@vben/access';
import { confirm, Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { IconifyIcon, MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { useClipboard } from '@vueuse/core';
import { message } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createApiKeyApi,
  deleteApiKeyApi,
  getApiKeyDetailApi,
  getApiKeyListApi,
  updateApiKeyApi,
  updateApiKeyStatusApi,
} from '#/plugins/api_key/api';

import { useApiKeySchema, useColumns } from './data';

const { hasAccessByCodes } = useAccess();
const canAddApiKey = hasAccessByCodes(['sys:apikey:add']);
const canEditApiKey = hasAccessByCodes(['sys:apikey:edit']);
const canDeleteApiKey = hasAccessByCodes(['sys:apikey:del']);
const { copy } = useClipboard({ legacy: true });
const searchName = ref('');
const formData = ref<
  | (CreateApiKeyParams & {
      id?: number;
      never_expires?: boolean;
    })
  | undefined
>();

const modalTitle = computed(() => {
  return formData.value?.id ? '编辑 API Key' : '新增 API Key';
});

async function onStatusChange(_: number, row: ApiKeyResult) {
  if (!canEditApiKey) {
    return false;
  }
  await updateApiKeyStatusApi(row.id);
  message.success($t('ui.actionMessage.operationSuccess'));
  return true;
}

const gridOptions: VxeTableGridOptions<ApiKeyResult> = {
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
  },
  height: 'auto',
  toolbarConfig: {
    refresh: true,
    refreshOptions: {
      code: 'query',
    },
    custom: true,
    zoom: true,
    search: true,
  },
  columns: useColumns(
    canEditApiKey,
    canDeleteApiKey,
    onActionClick,
    onStatusChange,
  ),
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getApiKeyListApi({
          page: page.currentPage,
          size: page.pageSize,
          name: searchName.value || undefined,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  showSearchForm: false,
});

async function refreshGrid() {
  await gridApi.query();
}

watch(searchName, (value) => {
  if (!value) {
    void refreshGrid();
  }
});

async function copyApiKeyValue(
  apiKey: string,
  successMessage = '令牌已复制到剪贴板',
) {
  await copy(apiKey);
  message.success(successMessage);
}

async function handleCopyApiKey(row: ApiKeyResult) {
  const detail = await getApiKeyDetailApi(row.id);
  await copyApiKeyValue(detail.key);
}

function openCreateModal() {
  if (!canAddApiKey) {
    return;
  }
  modalApi.setData(null).open();
}

function openEditModal(row: ApiKeyResult) {
  if (!canEditApiKey) {
    return;
  }
  modalApi.setData(row).open();
}

function applyExpirePreset(days: null | number) {
  if (days === null) {
    formApi.setValues({
      expire_time: undefined,
      never_expires: true,
    });
    return;
  }
  formApi.setValues({
    expire_time: dayjs().add(days, 'day').format('YYYY-MM-DD HH:mm:ss'),
    never_expires: false,
  });
}

async function handleDeleteApiKey(row: ApiKeyResult) {
  if (!canDeleteApiKey) {
    return;
  }
  try {
    await confirm({
      icon: 'warning',
      content: `确认删除令牌“${row.name}”吗？`,
    });
    await deleteApiKeyApi([row.id]);
    message.success($t('ui.actionMessage.deleteSuccess', [row.name]));
    await refreshGrid();
  } catch (error) {
    if (error instanceof Error && error.message !== '已取消') {
      throw error;
    }
  }
}

async function onActionClick({ code, row }: OnActionClickParams<ApiKeyResult>) {
  switch (code) {
    case 'delete': {
      await handleDeleteApiKey(row);
      break;
    }
    case 'edit': {
      openEditModal(row);
      break;
    }
  }
}

const [Form, formApi] = useVbenForm({
  compact: true,
  layout: 'vertical',
  showDefaultActions: false,
  schema: useApiKeySchema(applyExpirePreset),
  wrapperClass: 'grid grid-cols-1 gap-2',
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const isEdit = !!formData.value?.id;
    if (isEdit && !canEditApiKey) {
      return;
    }
    if (!isEdit && !canAddApiKey) {
      return;
    }
    modalApi.lock();
    try {
      const values = await formApi.getValues<
        CreateApiKeyParams & { never_expires?: boolean }
      >();
      const data: CreateApiKeyParams = {
        expire_time: values.never_expires ? null : (values.expire_time ?? null),
        name: values.name,
        remark: values.remark,
        status: values.status,
      };
      if (isEdit && formData.value?.id) {
        await updateApiKeyApi(formData.value.id, data);
        message.success($t('ui.actionMessage.operationSuccess'));
      } else {
        const created = await createApiKeyApi(data);
        await copyApiKeyValue(created.key, '创建成功，令牌已复制到剪贴板');
      }
      await modalApi.close();
      await refreshGrid();
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<ApiKeyResult | null>();
      formData.value = data
        ? {
            expire_time: data.expire_time ?? undefined,
            id: data.id,
            name: data.name,
            never_expires: !data.expire_time,
            remark: data.remark ?? undefined,
            status: data.status,
          }
        : undefined;
      formApi.resetForm();
      formApi.setValues(
        formData.value ?? {
          expire_time: undefined,
          never_expires: true,
          status: 1,
        },
      );
    }
  },
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <a-input-search
          v-model:value="searchName"
          allow-clear
          class="w-64"
          placeholder="按名称搜索"
          @search="refreshGrid"
        />
      </template>
      <template #toolbar-actions>
        <VbenButton :disabled="!canAddApiKey" @click="openCreateModal">
          <MaterialSymbolsAdd class="size-5" />
          新增令牌
        </VbenButton>
      </template>
      <template #key="{ row }">
        <div class="flex items-center justify-center gap-2">
          <a-tag
            color="success"
            class="mb-0 inline-flex max-w-[180px] items-center overflow-hidden text-ellipsis whitespace-nowrap !rounded-md !px-2 !py-0.5 font-mono text-xs leading-5"
          >
            {{ row.key || '-' }}
          </a-tag>
          <a-tooltip title="复制令牌">
            <a-button
              type="text"
              size="small"
              class="!px-1"
              @click.stop="handleCopyApiKey(row)"
            >
              <IconifyIcon icon="mdi:content-copy" class="size-4" />
            </a-button>
          </a-tooltip>
        </div>
      </template>
    </Grid>

    <Modal :title="modalTitle">
      <Form />
    </Modal>
  </Page>
</template>
