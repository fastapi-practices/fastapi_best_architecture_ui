<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SysApiResult } from '#/api';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getSysApiList } from '#/api';

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
        componentProps: {
          placeholder: '请输入 API 名称',
        },
        fieldName: 'name',
        label: '名称',
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入请求方法',
        },
        fieldName: 'method',
        label: '请求方法',
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入 API 路径',
        },
        fieldName: 'path',
        label: '请求路径',
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
      { field: 'name', title: 'API 名称', width: 250 },
      {
        field: 'method',
        title: '请求方法',
        cellRender: {
          name: 'CellTag',
          options: [
            { color: 'processing', label: 'GET', value: 'GET' },
            { color: 'success', label: 'POST', value: 'POST' },
            { color: 'cyan', label: 'PUT', value: 'PUT' },
            { color: 'error', label: 'PUT', value: 'DELETE' },
          ],
        },
        width: 250,
      },
      { field: 'path', title: 'API 路径', align: 'left', width: 350 },
      { field: 'remark', title: $t('page.table.mark'), align: 'left' },
      {
        field: 'created_time',
        title: $t('page.table.created_time'),
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
          return await getSysApiList({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<SysApiResult>,
});
</script>

<template>
  <Page>
    <Grid />
  </Page>
</template>
