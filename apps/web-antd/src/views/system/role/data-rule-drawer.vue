<script setup lang="ts">
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { SysMenuTreeResult } from '#/api';
import type { SysDataRulesResult } from '#/api/data-permission';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { getSysDataRulesApi } from '#/api/data-permission';
import { drawerDataRuleColumns } from '#/views/system/role/data';

const rules = ref<SysDataRulesResult[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  header: false,
  footer: false,
  class: 'w-2/5',
});

const dataScopeRuleOptions: VxeTableGridOptions<SysMenuTreeResult> = {
  rowConfig: {
    keyField: 'id',
  },
  maxHeight: '880',
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
        const res = await getSysDataRulesApi(
          drawerApi.getData().clickedDataScopeRow.id,
        );
        rules.value = res.rules;
        return rules.value;
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
        <a-alert class="h-8" type="info">
          <template #message>
            <div>
              数据范围
              <span class="text-primary mx-1 font-semibold">
                {{ drawerApi.getData().clickedDataScopeRow.name }}
              </span>
              已关联
              <span class="text-primary mx-1 font-semibold">
                {{ rules.length }}
              </span>
              条数据规则
            </div>
          </template>
        </a-alert>
      </template>
    </Grid>
  </Drawer>
</template>
