<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { OperaLogResult } from '#/api';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOperaLogListApi } from '#/api';

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
        fieldName: 'username',
        label: '用户名',
      },
      {
        component: 'Input',
        fieldName: 'ip',
        label: 'IP 地址',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            {
              label: '正常',
              value: 1,
            },
            {
              label: '异常',
              value: 0,
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
      { field: 'trace_id', title: '追踪 ID', width: 200 },
      { field: 'username', title: '用户名', width: 100 },
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
        width: 100,
      },
      { field: 'title', title: '操作标题', width: 150 },
      { field: 'path', title: '请求路径', width: 150 },
      {
        field: 'status',
        title: '状态',
        cellRender: {
          name: 'CellTag',
          options: [
            { color: 'success', label: '正常', value: 1 },
            { color: 'error', label: '异常', value: 0 },
          ],
        },
        width: 80,
      },
      { field: 'ip', title: 'IP 地址', width: 100 },
      { field: 'country', title: '国家', width: 100 },
      { field: 'os', title: '操作系统', width: 150 },
      { field: 'browser', title: '浏览器', width: 130 },
      { field: 'device', title: '设备', width: 80 },
      {
        field: 'args',
        title: '请求参数',
        formatter({ cellValue }) {
          if (cellValue) {
            return JSON.stringify(cellValue, null, 2);
          }
        },
        width: 150,
      },
      { field: 'code', title: '状态码', width: 80 },
      { field: 'msg', title: '消息', width: 150 },
      { field: 'cost_time', title: '耗时（ms）', width: 100 },
      { field: 'opera_time', title: '操作时间', width: 168 },
    ],
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
  } as VxeTableGridOptions<OperaLogResult>, // 表格数据接口（interface）
});
</script>

<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
