<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { WorkflowMessageResult } from '#/plugins/workflow/api';

import { computed, onActivated, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getWorkflowMessageListApi,
  readWorkflowMessageApi,
} from '#/plugins/workflow/api';
import { useWorkflowStore } from '#/store';

import { useWorkflowMessageColumns } from './data';

const route = useRoute();
const workflowStore = useWorkflowStore();
const router = useRouter();

const title = computed(() => `审批消息（未读 ${workflowStore.unreadCount}）`);

async function loadUnreadCount() {
  await workflowStore.refreshUnreadCount();
}

async function refreshIfNeeded() {
  if (route.query.refresh !== '1') {
    return;
  }
  await Promise.all([gridApi.query(), loadUnreadCount()]);
  await router.replace({
    path: route.path,
    query: {
      ...route.query,
      refresh: undefined,
    },
  });
}

async function onActionClick({
  code,
  row,
}: OnActionClickParams<WorkflowMessageResult>) {
  if (code === 'detail') {
    if (!row.instance_id) {
      message.warning('该消息没有关联流程实例');
      return;
    }
    await router.push(
      `/plugins/workflow/detail/${row.instance_id}?from=message&back=${encodeURIComponent(route.fullPath)}`,
    );
    return;
  }
  if (code === 'read' && !row.is_read) {
    await readWorkflowMessageApi(row.id);
    message.success('已标记为已读');
    await loadUnreadCount();
    gridApi.query();
  }
}

const gridOptions: VxeTableGridOptions<WorkflowMessageResult> = {
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
  columns: useWorkflowMessageColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getWorkflowMessageListApi({
          page: page.currentPage,
          size: page.pageSize,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

onMounted(async () => {
  await workflowStore.init();
  await loadUnreadCount();
  await refreshIfNeeded();
});

onActivated(refreshIfNeeded);
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="title" />
  </Page>
</template>
