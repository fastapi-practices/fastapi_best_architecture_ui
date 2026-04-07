<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WorkflowDefinitionResult } from '#/plugins/workflow/api';

import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getWorkflowDefinitionAvailableApi } from '#/plugins/workflow/api';

const router = useRouter();

function categoryName(row: WorkflowDefinitionResult) {
  return row.category_name || '-';
}

async function goToStart(id: number) {
  await router.push(`/plugins/workflow/instance/start/${id}`);
}

const gridOptions: VxeTableGridOptions<WorkflowDefinitionResult> = {
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
        return await getWorkflowDefinitionAvailableApi({
          page: page.currentPage,
          size: page.pageSize,
        });
      },
    },
  },
  columns: [
    { type: 'seq', width: 60, title: '#' },
    { field: 'name', title: '流程名称', minWidth: 220 },
    { field: 'code', title: '流程编码', width: 180 },
    {
      field: 'category_name',
      title: '流程分类',
      width: 160,
      slots: { default: 'category' },
    },
    { field: 'description', title: '描述', minWidth: 260 },
    {
      field: 'operation',
      title: '操作',
      width: 140,
      fixed: 'right',
      slots: { default: 'operation' },
    },
  ],
};

const [Grid] = useVbenVxeGrid({ gridOptions });

const emptyDescription = computed(() => '暂无可发起的流程');
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="发起申请">
      <template #category="{ row }">
        <span>{{ categoryName(row) }}</span>
      </template>
      <template #operation="{ row }">
        <a-button size="small" type="primary" @click="goToStart(row.id)">
          发起申请
        </a-button>
      </template>
      <template #empty>
        <a-empty :description="emptyDescription" />
      </template>
    </Grid>
  </Page>
</template>
