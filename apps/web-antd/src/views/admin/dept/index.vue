<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysDeptParams, SysDeptTreeResult } from '#/api';

import { computed, ref } from 'vue';

import {
  Page,
  useVbenForm,
  useVbenModal,
  VbenButton,
  z,
} from '@vben/common-ui';
import { AddData } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createSysDept,
  deleteSysDept,
  getSysDeptTree,
  updateSysDept,
} from '#/api';

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
        componentProps: {
          placeholder: '请输入部门名称',
        },
        fieldName: 'name',
        label: '部门名称',
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入负责人',
        },
        fieldName: 'leader',
        label: '负责人',
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入手机号号码',
        },
        fieldName: 'phone',
        label: '手机号码',
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
          placeholder: $t('page.form.select'),
        },
        fieldName: 'status',
        label: $t('page.form.status'),
      },
    ],
  },
  gridOptions: {
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
      { field: 'name', title: '名称', align: 'left', treeNode: true },
      { field: 'sort', title: '排序' },
      { field: 'leader', title: '负责人' },
      { field: 'phone', title: '手机号码' },
      { field: 'email', title: '邮箱' },
      {
        field: 'status',
        title: '状态',
        cellRender: {
          name: 'CellTag',
          options: [
            { color: 'success', label: '正常', value: 1 },
            { color: 'error', label: '停用', value: 0 },
          ],
        },
      },
      {
        field: 'created_time',
        title: $t('page.table.created_time'),
        width: 168,
      },
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
              text: '新增下级',
            },
            'edit',
            {
              code: 'delete',
              disabled: (row: SysDeptTreeResult) => {
                return row.id === 1;
              },
            },
          ],
        },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async (_, formValues) => {
          return await getSysDeptTree({ ...formValues });
        },
      },
    },
  } as VxeTableGridOptions<SysDeptTreeResult[]>,
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

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入部门名称',
      },
      fieldName: 'name',
      label: '部门名称',
      rules: 'required',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getSysDeptTree,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'parent_id',
      label: '父级部门',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入负责人名称',
      },
      fieldName: 'leader',
      label: '负责人',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号码',
        allowClear: true,
      },
      fieldName: 'phone',
      label: '手机号码',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
        allowClear: true,
      },
      fieldName: 'email',
      label: '邮箱地址',
      rules: z.string().email({ message: '无效的邮箱地址' }).optional(),
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
  ],
});

interface formSysDeptParams extends SysDeptParams {
  id?: number;
}

const formData = ref<formSysDeptParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['部门'])
    : $t('ui.actionTitle.create', ['部门']);
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<SysDeptParams>();
      try {
        await (formData.value?.id
          ? updateSysDept(formData.value.id, data)
          : createSysDept(data));
        modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<formSysDeptParams>();
      if (data) {
        if (data.parent_id === 0) {
          data.parent_id = undefined;
        }
        formData.value = data;
        formApi.setValues(formData.value);
      }
    }
  },
});

function onActionClick({ code, row }: OnActionClickParams<SysDeptTreeResult>) {
  switch (code) {
    case 'add': {
      modalApi.setData({ parent_id: row.id }).open();
      break;
    }
    case 'delete': {
      deleteSysDept(row.id).then(() => {
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
</script>

<template>
  <Page>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <AddData class="size-5" />
          新增部门
        </VbenButton>
      </template>
      <template #toolbar-tools>
        <a-button class="mr-2" type="primary" @click="expandAll">
          展开全部
        </a-button>
        <a-button type="primary" @click="collapseAll">折叠全部</a-button>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
  </Page>
</template>
