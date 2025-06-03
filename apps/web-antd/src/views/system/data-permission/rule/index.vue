<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysDataRuleResult } from '#/api/data-permission';

import { Page, VbenButton } from '@vben/common-ui';
import { AddData } from '@vben/icons';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getSysDataRuleListApi } from '#/api/data-permission';

import { querySchema, useColumns } from './data';

const dataRuleFormOptions: VbenFormProps = {
  showCollapseButton: false,
  submitButtonOptions: {
    content: $t('page.form.query'),
  },
  schema: querySchema,
};

const dataRuleGridOptions: VxeTableGridOptions<SysDataRuleResult> = {
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
    refresh: { code: 'query' },
    custom: true,
    zoom: true,
  },
  columns: useColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getSysDataRuleListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: dataRuleFormOptions,
  gridOptions: dataRuleGridOptions,
});

function onActionClick({ code, row }: OnActionClickParams<SysDataRuleResult>) {
  switch (code) {
    case 'delete': {
      console.error(row.id);
      onRefresh();
      break;
    }
    case 'edit': {
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton>
          <AddData class="size-5" />
          新增数据规则
        </VbenButton>
      </template>
    </Grid>
  </Page>
</template>
