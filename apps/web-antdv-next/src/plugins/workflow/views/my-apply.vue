<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WorkflowInstanceResult } from '#/plugins/workflow/api';

import { onActivated, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getWorkflowMyApplyListApi } from '#/plugins/workflow/api';

const route = useRoute();
const router = useRouter();

async function refreshIfNeeded() {
  if (route.query.refresh !== '1') {
    return;
  }
  await gridApi.query();
  await router.replace({
    path: route.path,
    query: {
      ...route.query,
      refresh: undefined,
    },
  });
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
        return await getWorkflowMyApplyListApi({
          page: page.currentPage,
          size: page.pageSize,
        });
      },
    },
  },
  columns: [
    { type: 'seq', width: 60, title: '#' },
    { field: 'instance_no', title: '实例编号', width: 180 },
    { field: 'title', title: '申请标题', minWidth: 260 },
    { field: 'status', title: '状态', width: 120 },
    { field: 'created_time', title: '发起时间', width: 180 },
    {
      field: 'operation',
      title: '操作',
      width: 140,
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
    <Grid table-title="我的申请">
      <template #operation="{ row }">
        <a-button
          size="small"
          @click="
            router.push(
              `/plugins/workflow/instance/detail/${row.id}?from=my-apply&back=${encodeURIComponent(route.fullPath)}`,
            )
          "
        >
          查看详情
        </a-button>
      </template>
    </Grid>
  </Page>
</template>
