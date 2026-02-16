<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { LoginLogResult, OperaLogResult } from '#/api';

import { computed, ref, watch } from 'vue';

import {
  confirm,
  JsonViewer,
  Page,
  useVbenDrawer,
  VbenButton,
} from '@vben/common-ui';
import { MaterialSymbolsDelete } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteOperaLogApi, getOperaLogListApi } from '#/api';

import { querySchema, useColumns } from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<OperaLogResult> = {
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
        return await getOperaLogListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const gridEvents: VxeGridListeners<LoginLogResult> = {
  checkboxChange: () => {
    const data = gridApi.grid.getCheckboxRecords(true);
    checkedRows.value = data.map((item: any) => item.id);
  },
  checkboxAll: () => {
    const data = gridApi.grid.getCheckboxRecords(true);
    checkedRows.value = data.map((item: any) => item.id);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});

function onRefresh() {
  gridApi.query();
}

function onActionClick({ code, row }: OnActionClickParams<OperaLogResult>) {
  switch (code) {
    case 'details': {
      operaLogDetails.value = row;
      drawerApi.open();
    }
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  footer: false,
  class: 'w-2/5',
});

const operaLogDetails = ref<OperaLogResult>();

const operaLogDescItems = computed(() => {
  const d = operaLogDetails.value;
  return [
    { key: 'trace_id', label: '追踪 ID', content: d?.trace_id, span: 2 },
    { key: 'path', label: '请求路径', content: d?.path, span: 2 },
    { key: 'username', label: '用户名', content: d?.username },
    { key: 'title', label: '操作标题', content: d?.title },
    { key: 'method', label: '请求方法', content: d?.method },
    { key: 'os', label: '操作系统', content: d?.os },
    { key: 'device', label: '设备', content: d?.device },
    { key: 'browser', label: '浏览器', content: d?.browser },
    { key: 'ip', label: '请求 IP', content: d?.ip },
    {
      key: 'country',
      label: '国家',
      content: d?.country === 'None' || !d?.country ? 'N/A' : d?.country,
    },
    {
      key: 'region',
      label: '地区',
      content: d?.region === 'None' || !d?.region ? 'N/A' : d?.region,
    },
    { key: 'city', label: '城市', content: d?.city },
    { key: 'code', label: '状态码', content: d?.code },
    { key: 'status', label: '状态' },
    { key: 'opera_time', label: '操作时间', content: d?.opera_time },
    { key: 'cost_time', label: '耗时' },
    { key: 'user_agent', label: '用户代理', content: d?.user_agent, span: 2 },
    { key: 'args', label: '请求参数', span: 2 },
    { key: 'msg', label: '响应消息', content: d?.msg },
  ];
});

const checkedRows = ref<number[]>([]);
const deleteDisable = ref<boolean>(true);
const deleteLoading = ref<boolean>(false);

const deleteLoginLog = async () => {
  confirm({
    icon: 'warning',
    content: '确定删除已勾选的记录吗？',
  }).then(async () => {
    deleteLoading.value = true;
    try {
      await deleteOperaLogApi(checkedRows.value);
      message.success($t('ui.actionMessage.deleteSuccess'));
      onRefresh();
      deleteDisable.value = true;
    } catch (error) {
      console.error(error);
    } finally {
      deleteLoading.value = false;
    }
  });
};

watch(checkedRows, () => {
  deleteDisable.value = checkedRows.value.length === 0;
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton
          variant="destructive"
          :disabled="deleteDisable"
          :loading="deleteLoading"
          @click="deleteLoginLog"
        >
          <MaterialSymbolsDelete class="size-5" />
          删除日志
        </VbenButton>
      </template>
    </Grid>
    <Drawer title="操作日志详情">
      <a-descriptions
        :styles="{ label: { color: '#6b7280' } }"
        class="ml-1"
        :column="2"
        :items="operaLogDescItems"
      >
        <template #contentRender="{ item }">
          <template v-if="item.key === 'status'">
            <a-tag v-if="operaLogDetails?.status === 1" color="success">
              成功
            </a-tag>
            <a-tag v-else color="error"> 失败 </a-tag>
          </template>
          <template v-else-if="item.key === 'cost_time'">
            <a-tag
              v-if="(operaLogDetails?.cost_time || 0) < 200"
              color="success"
            >
              {{ operaLogDetails?.cost_time }} ms
            </a-tag>
            <a-tag v-else color="warning">
              {{ operaLogDetails?.cost_time }} ms
            </a-tag>
          </template>
          <template v-else-if="item.key === 'args'">
            <JsonViewer
              class="mr-8 w-full"
              :value="operaLogDetails?.args"
              :copyable="!!operaLogDetails?.args"
              boxed
              expanded
              :expand-depth="3"
              :show-array-index="false"
              @copied="message.success('已复制请求参数')"
            />
          </template>
        </template>
      </a-descriptions>
    </Drawer>
  </Page>
</template>
