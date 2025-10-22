<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { LoginLogResult, OperaLogResult } from '#/api';

import { ref, watch } from 'vue';

import {
  confirm,
  JsonViewer,
  Page,
  useVbenDrawer,
  VbenButton,
} from '@vben/common-ui';
import { MaterialSymbolsDelete } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

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
        class="ml-1"
        :label-style="{ color: '#6b7280' }"
        :column="2"
      >
        <a-descriptions-item label="追踪 ID">
          {{ operaLogDetails?.trace_id }}
        </a-descriptions-item>
        <a-descriptions-item label="用户名">
          {{ operaLogDetails?.username }}
        </a-descriptions-item>
        <a-descriptions-item label="请求方法">
          {{ operaLogDetails?.method }}
        </a-descriptions-item>
        <a-descriptions-item label="请求路径">
          {{ operaLogDetails?.path }}
        </a-descriptions-item>
        <a-descriptions-item label="操作标题">
          {{ operaLogDetails?.title }}
        </a-descriptions-item>
        <a-descriptions-item label="操作系统">
          {{ operaLogDetails?.os }}
        </a-descriptions-item>
        <a-descriptions-item label="设备">
          {{ operaLogDetails?.device }}
        </a-descriptions-item>
        <a-descriptions-item label="浏览器">
          {{ operaLogDetails?.browser }}
        </a-descriptions-item>
        <a-descriptions-item label="请求 IP">
          {{ operaLogDetails?.ip }}
        </a-descriptions-item>
        <a-descriptions-item label="国家">
          {{
            operaLogDetails?.country === 'None' || !operaLogDetails?.country
              ? 'N/A'
              : operaLogDetails?.country
          }}
        </a-descriptions-item>
        <a-descriptions-item label="地区">
          {{
            operaLogDetails?.region === 'None' || !operaLogDetails?.region
              ? 'N/A'
              : operaLogDetails?.region
          }}
        </a-descriptions-item>
        <a-descriptions-item label="城市">
          {{ operaLogDetails?.city }}
        </a-descriptions-item>
        <a-descriptions-item label="状态码">
          {{ operaLogDetails?.code }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="operaLogDetails?.status === 1" color="success">
            成功
          </a-tag>
          <a-tag v-else color="error"> 失败 </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="操作时间">
          {{ operaLogDetails?.opera_time }}
        </a-descriptions-item>
        <a-descriptions-item label="耗时">
          <a-tag v-if="(operaLogDetails?.cost_time || 0) < 200" color="success">
            {{ operaLogDetails?.cost_time }} ms
          </a-tag>
          <a-tag v-else color="warning">
            {{ operaLogDetails?.cost_time }} ms
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="用户代理" :span="2">
          {{ operaLogDetails?.user_agent }}
        </a-descriptions-item>
        <a-descriptions-item label="请求参数" :span="2">
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
        </a-descriptions-item>
        <a-descriptions-item label="响应消息">
          {{ operaLogDetails?.msg }}
        </a-descriptions-item>
      </a-descriptions>
    </Drawer>
  </Page>
</template>
