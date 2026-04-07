<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WorkflowInstanceResult } from '#/plugins/workflow/api';

import { onActivated, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  approveWorkflowTaskApi,
  getWorkflowMyTodoListApi,
  rejectWorkflowTaskApi,
} from '#/plugins/workflow/api';
import { useWorkflowStore } from '#/store';

const route = useRoute();
const router = useRouter();
const workflowStore = useWorkflowStore();

function priorityLabel(row: WorkflowInstanceResult) {
  return row.current_task_id ? '处理中' : '普通';
}

async function refreshIfNeeded() {
  if (route.query.refresh !== '1') {
    return;
  }
  await Promise.all([gridApi.query(), workflowStore.refreshTodoCount()]);
  await router.replace({
    path: route.path,
    query: {
      ...route.query,
      refresh: undefined,
    },
  });
}

async function onApprove(row: WorkflowInstanceResult) {
  if (!row.current_task_id) {
    return;
  }
  await approveWorkflowTaskApi(row.current_task_id, { comment: '同意' });
  message.success('审批通过');
  await Promise.all([gridApi.query(), workflowStore.refreshTodoCount()]);
}

async function onReject(row: WorkflowInstanceResult) {
  if (!row.current_task_id) {
    return;
  }
  await rejectWorkflowTaskApi(row.current_task_id, { comment: '拒绝' });
  message.success('审批已拒绝');
  await Promise.all([gridApi.query(), workflowStore.refreshTodoCount()]);
}

const gridOptions: VxeTableGridOptions<WorkflowInstanceResult> = {
  rowConfig: {
    keyField: 'id',
  },
  height: 'auto',
  toolbarConfig: {
    refresh: true,
    refreshOptions: { code: 'query' },
    custom: true,
    zoom: true,
  },
  pagerConfig: {
    pageSize: 10,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getWorkflowMyTodoListApi({
          page: page.currentPage,
          size: page.pageSize,
        });
      },
    },
  },
  columns: [
    { type: 'seq', width: 60, title: '#' },
    { field: 'instance_no', title: '实例编号', width: 180 },
    { field: 'title', title: '申请标题', minWidth: 240 },
    {
      field: 'priority',
      title: '标识',
      width: 140,
      slots: { default: 'priority' },
    },
    { field: 'status', title: '状态', width: 120 },
    { field: 'created_time', title: '发起时间', width: 180 },
    {
      field: 'operation',
      title: '操作',
      width: 260,
      fixed: 'right',
      slots: { default: 'operation' },
    },
  ],
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

onMounted(refreshIfNeeded);
onActivated(refreshIfNeeded);
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="待我审批">
      <template #priority="{ row }">
        <a-space>
          <a-tag color="blue">{{ priorityLabel(row) }}</a-tag>
          <a-tag v-if="row.current_task_id" color="warning">待审批</a-tag>
        </a-space>
      </template>
      <template #operation="{ row }">
        <a-space>
          <a-button
            size="small"
            @click="
              router.push(
                `/plugins/workflow/instance/detail/${row.id}?from=my-todo&back=${encodeURIComponent(route.fullPath)}`,
              )
            "
          >
            审批
          </a-button>
          <a-button size="small" type="primary" @click="onApprove(row)">
            通过
          </a-button>
          <a-button size="small" danger @click="onReject(row)">拒绝</a-button>
        </a-space>
      </template>
    </Grid>
  </Page>
</template>
