<script setup lang="ts">
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SysMenuParams, SysMenuTreeResult } from '#/api';

import { computed, ref } from 'vue';

import {
  Page,
  useVbenForm,
  useVbenModal,
  VbenButton,
  z,
} from '@vben/common-ui';
import { AddData, IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createSysMenuApi,
  deleteSysMenuApi,
  getSysMenuTreeApi,
  updateSysMenuApi,
} from '#/api';
import { componentKeys } from '#/router/routes';

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
        fieldName: 'title',
        label: '菜单标题',
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
              label: '停用',
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
    pagerConfig: {
      enabled: false,
    },
    treeConfig: {
      parentField: 'parent_id',
    },
    columns: [
      {
        field: 'title',
        title: '标题',
        align: 'left',
        fixed: 'left',
        slots: { default: 'title_default' },
        treeNode: true,
        width: 160,
      },
      {
        field: 'type',
        title: '类型',
        width: 80,
        cellRender: {
          name: 'CellTag',
          options: [
            { color: 'orange', label: '目录', value: 0 },
            { color: 'default', label: '菜单', value: 1 },
            { color: 'blue', label: '按钮', value: 2 },
            { color: 'warning', label: '外链', value: 3 },
            { color: 'success', label: '内嵌', value: 4 },
          ],
        },
      },
      { field: 'perms', title: '权限标识', width: 150 },
      { field: 'sort', title: '排序', width: 50 },
      { field: 'name', title: '菜单名称', width: 120 },
      { field: 'path', title: '路由地址', width: 150 },
      { field: 'component', title: '页面组件', align: 'left', width: 300 },
      {
        field: 'status',
        title: '状态',
        width: 80,
        cellRender: {
          name: 'CellTag',
          options: [
            { color: 'success', label: '正常', value: 1 },
            { color: 'error', label: '停用', value: 0 },
          ],
        },
      },
      { field: 'remark', title: '备注' },
      {
        field: 'operation',
        title: $t('page.table.operation'),
        align: 'center',
        fixed: 'right',
        width: 200,
        cellRender: {
          attrs: {
            nameField: 'name',
            onClick: onActionClick,
          },
          name: 'CellOperation',
          options: [
            {
              code: 'add',
              text: '新增子菜单',
            },
            'edit',
            {
              code: 'delete',
              disabled: (row: SysMenuTreeResult) => {
                return row.name === 'System';
              },
            },
          ],
        },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async (_, formValues) => {
          return await getSysMenuTreeApi({ ...formValues });
        },
      },
    },
  } as VxeTableGridOptions<SysMenuTreeResult[]>,
});

function onRefresh() {
  gridApi.query();
}

const expandAll = () => {
  gridApi.grid?.setAllTreeExpand(true);
};

const collapseAll = () => {
  gridApi.grid?.setAllTreeExpand(false);
};

function onActionClick({ code, row }: OnActionClickParams<SysMenuTreeResult>) {
  switch (code) {
    case 'add': {
      modalApi.setData({ parent_id: row.id }).open();
      break;
    }
    case 'delete': {
      deleteSysMenuApi([row.id]).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      modalApi.setData(row).open();
      break;
    }
  }
}

const [Form, formApi] = useVbenForm({
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
  showDefaultActions: false,
  schema: [
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '目录', value: 0 },
          { label: '菜单', value: 1 },
          { label: '按钮', value: 2 },
          { label: '内嵌', value: 3 },
          { label: '外链', value: 4 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'type',
      formItemClass: 'col-span-2 md:col-span-2',
      label: '菜单类型',
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: '菜单标题',
      rules: 'required',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getSysMenuTreeApi,
        class: 'w-full',
        labelField: 'title',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'parent_id',
      label: '父级部门',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '菜单名称',
      rules: 'required',
    },
    {
      component: 'Input',
      dependencies: {
        show: (values) => {
          return [0, 1, 3].includes(values.type);
        },
        triggerFields: ['type'],
      },
      fieldName: 'path',
      label: '路由地址',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        defaultValue: 0,
        min: 0,
        style: { width: '100%' },
      },
      fieldName: 'sort',
      label: '排序',
    },
    {
      component: 'IconPicker',
      dependencies: {
        show: (values) => {
          return [0, 1, 3, 4].includes(values.type);
        },
        triggerFields: ['type'],
      },
      fieldName: 'icon',
      label: '图标',
    },
    {
      component: 'AutoComplete',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        filterOption(input: string, option: { value: string }) {
          return option.value.toLowerCase().includes(input.toLowerCase());
        },
        options: componentKeys.map((v: any) => ({ value: v })),
      },
      dependencies: {
        rules: (values) => {
          return values.type === 1 ? 'required' : null;
        },
        show: (values) => {
          return values.type === 1;
        },
        triggerFields: ['type'],
      },
      fieldName: 'component',
      label: '组件路径',
    },
    {
      component: 'Input',
      dependencies: {
        rules: (values) => {
          return values.type === 2 ? 'required' : null;
        },
        show: (values) => {
          return [1, 2, 3].includes(values.type);
        },
        triggerFields: ['type'],
      },
      fieldName: 'perms',
      label: '权限标识',
    },
    {
      component: 'Input',
      dependencies: {
        show: (values) => {
          return [3, 4].includes(values.type);
        },
        triggerFields: ['type'],
      },
      fieldName: 'link',
      label: '链接地址',
      rules: z.string().url($t('ui.formRules.invalidURL')),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
      rules: 'required',
    },
    {
      component: 'Switch',
      defaultValue: true,
      dependencies: {
        show: (values) => {
          return values.type !== 2;
        },
        triggerFields: ['type'],
      },
      fieldName: 'display',
      label: '是否隐藏',
    },
    {
      component: 'Switch',
      defaultValue: true,
      dependencies: {
        show: (values) => {
          return values.type === 1;
        },
        triggerFields: ['type'],
      },
      fieldName: 'cache',
      label: '是否缓存',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
  ],
});

interface formSysMenuParams extends SysMenuParams {
  id?: number;
}

const formData = ref<formSysMenuParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['菜单'])
    : $t('ui.actionTitle.create', ['菜单']);
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-5/12',
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<SysMenuParams>();
      try {
        await (formData.value?.id
          ? updateSysMenuApi(formData.value.id, data)
          : createSysMenuApi(data));
        await modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SysMenuParams>();
      if (data) {
        if (data.parent_id === 0) {
          data.parent_id = 0;
        }
        formData.value = data;
        formApi.setValues(formData.value);
      }
    }
  },
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <AddData class="size-5" />
          新增菜单
        </VbenButton>
      </template>
      <template #toolbar-tools>
        <a-button class="mr-2" type="primary" @click="expandAll">
          展开全部
        </a-button>
        <a-button type="primary" @click="collapseAll">折叠全部</a-button>
      </template>
      <template #title_default="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 flex-shrink-0">
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
          <span class="ml-1 flex-auto">{{ row.title }}</span>
        </div>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
  </Page>
</template>
