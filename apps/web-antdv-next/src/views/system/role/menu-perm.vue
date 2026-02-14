<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SysDataScopeResult, SysMenuTreeResult } from '#/api';

import { nextTick, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getSysDataScopesApi,
  getSysMenuTreeApi,
  getSysRoleDataScopesApi,
  updateSysRoleDataScopesApi,
  updateSysRoleMenuApi,
} from '#/api';

import {
  drawerColumns,
  drawerDataScopeColumns,
  drawerQuerySchema,
} from './data';
import ExtraDataRuleDrawer from './data-perm.vue';

const activeKey = ref('0');
const tabItems = [
  { key: '0', label: '菜单权限' },
  { key: '1', label: '数据权限' },
];
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
        message.success($t('ui.actionMessage.operationSuccess'));
        drawerApi.close();
      });
    } else {
      const checkedRows = dataScopeGridApi.grid.getCheckboxRecords(true);
      updateSysRoleDataScopesApi(
        clickRow.value,
        checkedRows.map((item: any) => item.id),
      ).then(() => {
        message.success($t('ui.actionMessage.operationSuccess'));
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
  height: 'auto',
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
    autoLoad: false,
    ajax: {
      query: async () => {
        const [data, checkedKeys] = await Promise.all([
          getSysDataScopesApi(),
          getSysRoleDataScopesApi(clickRow.value),
        ]);
        defaultCheckedDataScopesKeys.value = checkedKeys;
        dataScopeGridApi.setGridOptions({
          checkboxConfig: {
            checkRowKeys: checkedKeys,
          },
        });
        return data;
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
    await dataScopeGridApi.query();
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
    <a-tabs v-model:active-key="activeKey" type="card" :items="tabItems">
      <template #contentRender="{ item }">
        <template v-if="item.key === '0'">
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
                <template #title>
                  <div>
                    已关联
                    <span class="mx-1 font-semibold text-primary">
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
          </Grid>
        </template>
        <template v-else-if="item.key === '1'">
          <div class="h-[775px]">
            <DataScopeGrid>
              <template #toolbar-actions>
                <a-alert class="h-8" type="info">
                  <template #title>
                    <div>
                      已关联
                      <span class="mx-1 font-semibold text-primary">
                        {{ defaultCheckedDataScopesKeys.length }}
                      </span>
                      个数据范围节点（非实时）
                    </div>
                  </template>
                </a-alert>
              </template>
            </DataScopeGrid>
          </div>
        </template>
      </template>
    </a-tabs>
  </Drawer>
  <DataRuleDrawer />
</template>
