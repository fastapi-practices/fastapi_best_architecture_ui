<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SysMenuTreeResult } from '#/api';
import type { SysDataScopeResult } from '#/api/data-permission';

import { nextTick, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getSysMenuTreeApi,
  getSysRoleDataScopesApi,
  updateSysRoleDataScopesApi,
  updateSysRoleMenuApi,
} from '#/api';
import { getSysDataScopesApi } from '#/api/data-permission';

import {
  drawerColumns,
  drawerDataScopeColumns,
  drawerQuerySchema,
} from './data';
import ExtraDataRuleDrawer from './data-rule-drawer.vue';

const activeKey = ref('0');
const clickRow = ref<number>(0);
const defaultCheckedRoleMenuKeys = ref<number[]>([]);
const checkStrictly = ref<boolean>(true);
const defaultCheckedDataScopesKeys = ref<number[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  header: false,
  class: 'w-1/2',
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    if (activeKey.value === '0') {
      const indeterminateRows = gridApi.grid.getCheckboxIndeterminateRecords();
      const checkedRows = gridApi.grid.getCheckboxRecords(true);
      updateSysRoleMenuApi(clickRow.value, [
        ...indeterminateRows.map((item: any) => item.id),
        ...checkedRows.map((item: any) => item.id),
      ]).then(() => {
        drawerApi.close();
      });
    } else {
      const checkedRows = dataScopeGridApi.grid.getCheckboxRecords(true);
      updateSysRoleDataScopesApi(
        clickRow.value,
        checkedRows.map((item: any) => item.id),
      ).then(() => {
        drawerApi.close();
      });
    }
  },
  onOpenChange(isOpen: boolean) {
    clickRow.value = drawerApi.getData().pk;
    if (isOpen && activeKey.value === '0') {
      defaultCheckedRoleMenuKeys.value = drawerApi.getData().checkedRoleMenu;
    }
  },
});

/**
 * 菜单权限
 */
const formOptions: VbenFormProps = {
  showCollapseButton: false,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-2',
  schema: drawerQuerySchema,
};

const gridOptions: VxeTableGridOptions<SysMenuTreeResult> = {
  rowConfig: {
    keyField: 'id',
  },
  toolbarConfig: {
    zoom: true,
  },
  checkboxConfig: {
    labelField: 'title',
    highlight: true,
    checkRowKeys: [],
    showHeader: false,
    checkStrictly: true,
  },
  pagerConfig: {
    enabled: false,
  },
  treeConfig: {
    parentField: 'parent_id',
    expandAll: true,
  },
  columns: drawerColumns,
  proxyConfig: {
    ajax: {
      query: async (_, formValues) => {
        return await getSysMenuTreeApi(formValues);
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const expandAll = () => {
  gridApi.grid?.setAllTreeExpand(true);
};

const collapseAll = () => {
  gridApi.grid?.setAllTreeExpand(false);
};

watch(defaultCheckedRoleMenuKeys, async (newValue) => {
  await nextTick();
  gridApi.setGridOptions({
    checkboxConfig: {
      checkRowKeys: newValue,
    },
  });
});

watch(checkStrictly, (newValue) => {
  gridApi.setGridOptions({
    checkboxConfig: {
      showHeader: !newValue,
      checkStrictly: newValue,
    },
  });
});

/**
 * 数据权限
 */
const dataScopeGridOptions: VxeTableGridOptions<SysMenuTreeResult> = {
  rowConfig: {
    keyField: 'id',
  },
  maxHeight: '775',
  virtualYConfig: {
    enabled: true,
    gt: 0,
  },
  checkboxConfig: {
    labelField: 'name',
    highlight: true,
    checkRowKeys: [],
  },
  pagerConfig: {
    enabled: false,
  },
  columns: drawerDataScopeColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async () => {
        return await getSysDataScopesApi();
      },
    },
  },
};

const [DataScopeGrid, dataScopeGridApi] = useVbenVxeGrid({
  gridOptions: dataScopeGridOptions,
});

function onActionClick({ code, row }: OnActionClickParams<SysDataScopeResult>) {
  switch (code) {
    case 'details': {
      dataRuleDrawerApi
        .setData({
          clickedDataScopeRow: row,
        })
        .open();
      break;
    }
  }
}

watch(activeKey, async (newValue) => {
  if (newValue === '1') {
    defaultCheckedDataScopesKeys.value = await getSysRoleDataScopesApi(
      clickRow.value,
    );
    dataScopeGridApi.setGridOptions({
      checkboxConfig: {
        checkRowKeys: defaultCheckedDataScopesKeys.value,
      },
    });
  }
});

/**
 * 规则详情
 */
const [DataRuleDrawer, dataRuleDrawerApi] = useVbenDrawer({
  connectedComponent: ExtraDataRuleDrawer,
});
</script>
<template>
  <Drawer>
    <a-tabs v-model:active-key="activeKey" type="card">
      <a-tab-pane key="0" tab="菜单权限">
        <Grid>
          <template #toolbar-actions>
            <a-radio-group
              v-model:value="checkStrictly"
              class="h-8"
              button-style="solid"
            >
              <a-radio-button :value="true">父子独立</a-radio-button>
              <a-radio-button :value="false">父子联动</a-radio-button>
            </a-radio-group>
            <a-alert class="mx-2 h-8" type="info">
              <template #message>
                <div>
                  已关联
                  <span class="text-primary mx-1 font-semibold">
                    {{ defaultCheckedRoleMenuKeys.length }}
                  </span>
                  个节点（非实时）
                </div>
              </template>
            </a-alert>
          </template>
          <template #toolbar-tools>
            <a-button class="mr-2" type="primary" @click="expandAll">
              展开全部
            </a-button>
            <a-button type="primary" @click="collapseAll">折叠全部</a-button>
          </template>
          <template #icon="{ row }">
            <div class="m-auto size-5">
              <IconifyIcon
                v-if="row.type === 2"
                icon="carbon:security"
                class="size-full"
              />
              <a-image
                v-else-if="/^https?:\/\/.*$/.test(row.icon || '')"
                :src="row.icon"
                class="size-full"
              />
              <IconifyIcon
                v-else
                :icon="row.icon || 'carbon:circle-dash'"
                class="size-full"
              />
            </div>
          </template>
        </Grid>
      </a-tab-pane>
      <a-tab-pane key="1" tab="数据权限">
        <DataScopeGrid>
          <template #toolbar-actions>
            <a-alert class="h-8" type="info">
              <template #message>
                <div>
                  已关联
                  <span class="text-primary mx-1 font-semibold">
                    {{ defaultCheckedDataScopesKeys.length }}
                  </span>
                  个数据范围节点（非实时）
                </div>
              </template>
            </a-alert>
          </template>
        </DataScopeGrid>
      </a-tab-pane>
    </a-tabs>
  </Drawer>
  <DataRuleDrawer />
</template>
