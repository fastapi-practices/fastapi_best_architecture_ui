<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { TaskResult } from '#/api';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

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
import { deleteTaskResultApi, getTaskResultListApi } from '#/api';

import { querySchema, useColumns } from './data';

const route = useRoute();

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

function onActionClick({ code, row }: OnActionClickParams<TaskResult>) {
  switch (code) {
    case 'details': {
      taskResultDetails.value = row;
      drawerApi.open();
      break;
    }
  }
}

const gridOptions: VxeTableGridOptions<TaskResult> = {
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
        return await getTaskResultListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const gridEvents: VxeGridListeners<TaskResult> = {
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

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  footer: false,
  class: 'w-2/5',
});

const taskResultDetails = ref<TaskResult>();

function parseJsonSafe(value: any): any {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

const taskResultDescItems = computed(() => {
  const d = taskResultDetails.value;
  return [
    { key: 'task_id', label: '任务 ID', content: d?.task_id, span: 2 },
    { key: 'name', label: '任务名称', content: d?.name },
    { key: 'status', label: '状态' },
    { key: 'date_done', label: '结束时间', content: d?.date_done || 'N/A' },
    { key: 'retries', label: '重试次数', content: d?.retries ?? 0 },
    { key: 'worker', label: 'Worker', content: d?.worker || 'N/A', span: 2 },
    { key: 'queue', label: '队列', content: d?.queue || 'N/A', span: 2 },
    { key: 'args', label: '位置参数', span: 2 },
    { key: 'kwargs', label: '关键参数', span: 2 },
    { key: 'result', label: '执行结果', span: 2 },
    { key: 'traceback', label: '错误回溯', span: 2 },
  ];
});

const checkedRows = ref<number[]>([]);
const deleteDisable = ref<boolean>(true);
const deleteLoading = ref<boolean>(false);

const deleteTaskResult = async () => {
  confirm({
    icon: 'warning',
    content: '确定删除已勾选的记录吗？',
  }).then(async () => {
    deleteLoading.value = true;
    try {
      await deleteTaskResultApi(checkedRows.value);
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

onMounted(() => {
  if (route.query) {
    gridApi.reload({ name: route.query.name ?? undefined });
  }
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
          @click="deleteTaskResult"
        >
          <MaterialSymbolsDelete class="size-5" />
          删除记录
        </VbenButton>
      </template>
    </Grid>
    <Drawer title="任务执行记录详情">
      <a-descriptions
        :styles="{ label: { color: '#6b7280' } }"
        class="ml-1"
        :column="2"
        :items="taskResultDescItems"
      >
        <template #contentRender="{ item }">
          <template v-if="item.key === 'status'">
            <a-tag
              v-if="taskResultDetails?.status === 'SUCCESS'"
              color="success"
            >
              SUCCESS
            </a-tag>
            <a-tag
              v-else-if="taskResultDetails?.status === 'FAILURE'"
              color="error"
            >
              FAILURE
            </a-tag>
            <a-tag
              v-else-if="
                taskResultDetails?.status === 'PENDING' ||
                taskResultDetails?.status === 'STARTED'
              "
              color="processing"
            >
              {{ taskResultDetails?.status }}
            </a-tag>
            <a-tag
              v-else-if="taskResultDetails?.status === 'RETRY'"
              color="warning"
            >
              RETRY
            </a-tag>
            <a-tag
              v-else-if="taskResultDetails?.status === 'REVOKED'"
              color="default"
            >
              REVOKED
            </a-tag>
            <a-tag v-else color="processing">
              {{ taskResultDetails?.status }}
            </a-tag>
          </template>
          <template v-else-if="item.key === 'args'">
            <JsonViewer
              v-if="taskResultDetails?.args"
              class="mr-8 w-full"
              :value="parseJsonSafe(taskResultDetails?.args)"
              :copyable="!!taskResultDetails?.args"
              boxed
              expanded
              :expand-depth="3"
              :show-array-index="false"
              @copied="message.success('已复制位置参数')"
            />
            <span v-else>无</span>
          </template>
          <template v-else-if="item.key === 'kwargs'">
            <JsonViewer
              v-if="taskResultDetails?.kwargs"
              class="mr-8 w-full"
              :value="parseJsonSafe(taskResultDetails?.kwargs)"
              :copyable="!!taskResultDetails?.kwargs"
              boxed
              expanded
              :expand-depth="3"
              :show-array-index="false"
              @copied="message.success('已复制关键字参数')"
            />
            <span v-else>无</span>
          </template>
          <template v-else-if="item.key === 'result'">
            <div v-if="taskResultDetails?.result">
              {{ taskResultDetails?.result }}
            </div>
            <span v-else>无</span>
          </template>
          <template v-else-if="item.key === 'traceback'">
            <div v-if="taskResultDetails?.traceback">
              {{ taskResultDetails?.traceback }}
            </div>
            <span v-else>无</span>
          </template>
        </template>
      </a-descriptions>
    </Drawer>
  </Page>
</template>
