<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SysRoleResult } from '#/api';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getSysRoleList } from '#/api';

const [Grid] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    submitButtonOptions: {
      content: $t('page.form.query'),
    },
    schema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '角色名称',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            {
              label: '已启用',
              value: 1,
            },
            {
              label: '已停用',
              value: 1,
            },
          ],
        },
        fieldName: 'status',
        label: $t('page.form.status'),
      },
    ],
  },
  gridOptions: {
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
    columns: [
      { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
      {
        field: 'seq',
        title: $t('page.table.id'),
        type: 'seq',
        width: 50,
      },
      { field: 'name', title: '角色名称' },
      {
        field: 'status',
        title: '状态',
        cellRender: {
          name: 'CellTag',
        },
      },
      { field: 'remark', title: $t('page.table.mark'), align: 'left' },
      {
        field: 'created_time',
        title: $t('page.table.created_time'),
        width: 168,
      },
      {
        field: 'updated_time',
        title: $t('page.table.updated_time'),
        width: 168,
      },
      {
        field: 'operation',
        title: $t('page.table.operation'),
        align: 'center',
        fixed: 'right',
        width: 130,
      },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getSysRoleList({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<SysRoleResult>,
});
</script>

<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
