<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { SysMenuTreeResult } from '#/api';

import { nextTick, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getSysMenuTreeApi, updateSysRoleMenu } from '#/api';

import { drawerColumns, drawerQuerySchema } from './data';

const activeKey = ref('0');
const defaultCheckedRoleMenuKeys = ref<number[]>([]);
const checkStrictly = ref<boolean>(true);

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
      updateSysRoleMenu(drawerApi.getData().pk, [
        ...indeterminateRows.map((item: any) => item.id),
        ...checkedRows.map((item: any) => item.id),
      ]).then(() => {
        drawerApi.close();
      });
    }
  },
  onOpenChange(isOpen: boolean) {
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
    content: $t('page.form.query'),
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
</script>
<template>
  <Drawer title="权限设置">
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
                  已选中
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
              <IconifyIcon
                v-else
                :icon="row.icon || 'carbon:circle-dash'"
                class="size-full"
              />
            </div>
          </template>
        </Grid>
      </a-tab-pane>
      <a-tab-pane key="1" tab="数据权限">数据权限</a-tab-pane>
    </a-tabs>
  </Drawer>
</template>
