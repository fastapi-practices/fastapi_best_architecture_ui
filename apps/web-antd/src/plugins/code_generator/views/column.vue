<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  CodeGenColumnParams,
  CodeGenColumnResult,
} from '#/plugins/code_generator/api';

import { computed, h, ref } from 'vue';

import {
  confirm,
  useVbenDrawer,
  useVbenModal,
  VbenButton,
} from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';
import { downloadFileFromBlob } from '@vben/utils';

import { Alert, List, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createCodeGenColumnApi,
  deleteCodeGenColumnApi,
  downloadCodeApi,
  generateCodeApi,
  getAllCodeGenBusinessColumnApi,
  getCodeGenPathApi,
  updateCodeGenColumnApi,
} from '#/plugins/code_generator/api';

import { columnSchema, useColumnColumns } from './data';
import ExtraModal from './preview.vue';

const gridOptions: VxeTableGridOptions<CodeGenColumnResult[]> = {
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
  columns: useColumnColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async () => {
        return await getAllCodeGenBusinessColumnApi(drawerApi.getData().pk);
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function onActionClick({
  code,
  row,
}: OnActionClickParams<CodeGenColumnResult>) {
  switch (code) {
    case 'delete': {
      deleteCodeGenColumnApi(row.id).then(() => {
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

function onRefresh() {
  gridApi.query();
}

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  closable: false,
  cancelText: '预览',
  confirmText: '下载',
  class: 'w-2/3',
  onCancel: () => {
    previewModalApi.setData({ pk: drawerApi.getData().pk }).open();
  },
  onConfirm: async () => {
    try {
      const res = await downloadCodeApi(drawerApi.getData().pk);
      downloadFileFromBlob({ fileName: 'fba_generator', source: res });
    } catch (error) {
      console.error(error);
    }
  },
});

async function showGenerate() {
  const paths = await getCodeGenPathApi(drawerApi.getData().pk);
  confirm({
    title: '警告',
    content: h('div', null, [
      h(Alert, {
        type: 'error',
        showIcon: false,
        message:
          '代码生成将进行磁盘文件（覆盖）写入，切勿在生产环境中使用！！！',
      }),
      h('br'),
      h(List, {
        bordered: true,
        dataSource: paths,
        header: '即将写入以下文件：',
        renderItem: ({ item }) =>
          h(List.Item, null, h('p', { class: 'text-orange-500' }, item)),
      }),
    ]),
    icon: 'error',
    confirmText: '不怂！就是干',
  }).then(async () => {
    try {
      await generateCodeApi(drawerApi.getData().pk);
      message.success($t('ui.actionMessage.operationSuccess'));
    } catch (error) {
      console.error(error);
    }
  });
}

interface formCodeGenColumnParams extends CodeGenColumnParams {
  id?: number;
}

const formData = ref<formCodeGenColumnParams>();

const modalTile = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['模型列'])
    : $t('ui.actionTitle.create', ['模型列']);
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: columnSchema,
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  class: 'w-1/3',
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CodeGenColumnParams>();
      try {
        await (formData.value?.id
          ? updateCodeGenColumnApi(formData.value.id, data)
          : createCodeGenColumnApi(data));
        message.success($t('ui.actionMessage.operationSuccess'));
        await modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<formCodeGenColumnParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
        if (!formData.value.id) {
          formApi.setFieldValue('gen_business_id', drawerApi.getData().pk);
        }
      }
    }
  },
});

const [PreviewModal, previewModalApi] = useVbenModal({
  connectedComponent: ExtraModal,
});
</script>

<template>
  <Drawer title="业务模型列">
    <Grid />
    <template #extra>
      <a-alert :show-icon="false" class="mr-3">
        <template #message>
          主键 ID 列状态：<a-tag color="success">自动生成</a-tag>
          默认时间列状态：
          <a-tag
            :color="
              drawerApi.getData().default_datetime_column
                ? 'success'
                : 'warning'
            "
          >
            {{
              drawerApi.getData().default_datetime_column ? '已配置' : '未配置'
            }}
          </a-tag>
        </template>
      </a-alert>
      <VbenButton @click="modalApi.setData(null).open()">
        <MaterialSymbolsAdd class="size-5" />
        新增模型列
      </VbenButton>
    </template>
    <template #center-footer>
      <a-button type="primary" @click="showGenerate">生成</a-button>
    </template>
  </Drawer>
  <Modal :title="modalTile">
    <Form />
  </Modal>
  <PreviewModal />
</template>
