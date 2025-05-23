<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { LoginLogResult } from '#/api';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLoginLogListApi } from '#/api';

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
              label: '成功',
              value: 1,
            },
            {
              label: '失败',
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
      { field: 'username', title: '用户名' },
      {
        field: 'status',
        title: '状态',
        cellRender: {
          name: 'CellTag',
          options: [
            { color: 'success', label: '成功', value: 1 },
            { color: 'error', label: '失败', value: 0 },
          ],
        },
      },
      { field: 'ip', title: 'IP 地址' },
      { field: 'country', title: '国家' },
      { field: 'region', title: '地区' },
      { field: 'os', title: '操作系统' },
      { field: 'browser', title: '浏览器' },
      { field: 'device', title: '设备' },
      { field: 'msg', title: '消息' },
      { field: 'login_time', title: '登录时间', width: 168 },
      {
        field: 'created_time',
        title: $t('page.table.created_time'),
        width: 168,
      },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getLoginLogListApi({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<LoginLogResult>,
});
</script>

<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
