<script setup lang="ts">
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { SysDataScopeRulesResult } from '#/api/data-permission';

import { useVbenDrawer } from '@vben/common-ui';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { getSysDataScopeRulesApi } from '#/api/data-permission';
import { drawerDataRuleColumns } from '#/views/system/role/data';

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  header: false,
  footer: false,
  class: 'w-2/5',
});

const dataScopeRuleOptions: VxeTableGridOptions<SysDataScopeRulesResult> = {
  rowConfig: {
    keyField: 'id',
  },
  height: 'auto',
  virtualYConfig: {
    enabled: true,
    gt: 0,
  },
  pagerConfig: {
    enabled: false,
  },
  columns: drawerDataRuleColumns,
  proxyConfig: {
    ajax: {
      query: async () => {
        const res = await getSysDataScopeRulesApi(
          drawerApi.getData().clickedDataScopeRow.id,
        );
        return res.rules;
      },
    },
  },
};
const [Grid] = useVbenVxeGrid({
  gridOptions: dataScopeRuleOptions,
});
</script>

<template>
  <Drawer title="数据权限规则详情">
    <Grid>
      <template #toolbar-actions>
        <a-alert class="mb-2" type="warning" show-icon>
          <template #message>
            此页面仅用于数据展示，如需操作，请前往 【系统管理】 -> 【数据权限】
          </template>
        </a-alert>
      </template>
    </Grid>
  </Drawer>
</template>
