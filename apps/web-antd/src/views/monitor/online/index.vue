<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { OnlineMonitorResult } from '#/api';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOnlineMonitorApi, kickOutOnlineApi } from '#/api';

const onlineCount = ref<number>(0);
const [Grid, gridApi] = useVbenVxeGrid({
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
    ],
  },
  gridOptions: {
    rowConfig: {
      keyField: 'id',
    },
    virtualYConfig: {
      enabled: true,
      gt: 0,
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
    pagerConfig: {
      enabled: false,
    },
    columns: [
      {
        field: 'seq',
        title: $t('page.table.id'),
        type: 'seq',
        width: 50,
      },
      { field: 'session_uuid', title: '会话 UUID' },
      { field: 'username', title: '用户名' },
      { field: 'nickname', title: '昵称' },
      { field: 'ip', title: 'IP 地址' },
      { field: 'os', title: '操作系统' },
      { field: 'browser', title: '浏览器' },
      { field: 'device', title: '设备' },
      {
        field: 'status',
        title: '状态',
        cellRender: {
          name: 'CellTag',
          options: [
            { color: 'success', label: '在线', value: 1 },
            { color: 'warning', label: '离线', value: 0 },
          ],
        },
      },
      { field: 'last_login_time', title: '最后登录时间' },
      { field: 'expire_time', title: '过期时间' },
      {
        field: 'operation',
        title: $t('page.table.operation'),
        align: 'center',
        fixed: 'right',
        width: 130,
        cellRender: {
          attrs: {
            nameField: 'nickname',
            onClick: onActionClick,
          },
          name: 'CellOperation',
          options: [
            {
              code: 'delete',
              text: '强制下线',
            },
          ],
        },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async (_, formValues) => {
          const res = await getOnlineMonitorApi({
            ...formValues,
          });
          onlineCount.value = res.length;
          return res;
        },
      },
    },
  } as VxeTableGridOptions<OnlineMonitorResult[]>, // 表格数据接口（interface）
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<OnlineMonitorResult>) {
  if (code === 'delete') {
    kickOutOnlineApi(row.id, { session_uuid: row.session_uuid }).then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.nickname]),
        key: 'action_process_msg',
      });
      onRefresh();
    });
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
        <div class="mr-1 pl-1 text-[1rem]">
          <div>
            当前在线人数：
            <span class="text-primary font-bold">{{ onlineCount }}</span>
          </div>
        </div>
      </template>
    </Grid>
  </Page>
</template>
