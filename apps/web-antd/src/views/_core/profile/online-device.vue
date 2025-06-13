<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { OnlineMonitorResult } from '#/api';

import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOnlineMonitorApi, kickOutOnlineApi } from '#/api';

import { useColumns } from './data';

const props = defineProps<{ username: string }>();

const gridOptions: VxeTableGridOptions<OnlineMonitorResult> = {
  rowConfig: {
    keyField: 'session_uuid',
  },
  virtualYConfig: {
    enabled: true,
    gt: 0,
  },
  minHeight: '294',
  maxHeight: '686',
  toolbarConfig: {
    refresh: { code: 'query' },
    custom: true,
    zoom: true,
  },
  pagerConfig: {
    enabled: false,
  },
  columns: useColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async () => {
        return await getOnlineMonitorApi({
          username: props.username,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function onRefresh() {
  gridApi.query();
}

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
</script>

<template>
  <Grid>
    <template #toolbar-actions>
      <div class="mr-1 pl-1 text-[1rem]">我的已登录设备</div>
    </template>
  </Grid>
</template>
