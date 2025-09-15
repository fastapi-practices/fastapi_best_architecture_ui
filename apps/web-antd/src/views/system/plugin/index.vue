<script setup lang="ts">
import type { PluginResult } from '#/api';

import { onMounted, ref } from 'vue';

import { confirm, Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { downloadFileFromBlobPart } from '@vben/utils';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  downloadPluginApi,
  getPluginChangedApi,
  getPluginListApi,
  installGitPluginApi,
  installZipPluginApi,
  uninstallPluginApi,
  updatePluginStatus,
} from '#/api';

import { userSchema } from './data';

const pluginChanged = ref<boolean>(false);
const pluginInfo = ref<PluginResult[]>();

const fetchPluginChanged = async () => {
  try {
    pluginChanged.value = await getPluginChangedApi();
  } catch (error) {
    console.error(error);
  }
};

const fetchPlugin = async () => {
  try {
    pluginInfo.value = await getPluginListApi();
  } catch (error) {
    console.error(error);
  }
};

const fileList = ref<any[]>([]);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  wrapperClass: 'mt-8',
  schema: userSchema(fileList),
});

function downloadConfirm(plugin: string) {
  confirm({
    icon: 'success',
    content: '确认打包并下载此插件吗？',
  }).then(async () => {
    try {
      const res = await downloadPluginApi(plugin);
      downloadFileFromBlobPart({ fileName: `${plugin}.zip`, source: res });
    } catch (error) {
      console.error(error);
    }
  });
}

function deleteConfirm(plugin: string) {
  confirm({
    icon: 'warning',
    content: '确认删除此插件吗？',
  }).then(async () => {
    try {
      await uninstallPluginApi(plugin);
      message.success($t('ui.actionMessage.deleteSuccess'));
      await fetchPlugin();
      await fetchPluginChanged();
    } catch (error) {
      console.error(error);
    }
  });
}

const editPluginStatus = async (plugin: string) => {
  try {
    await updatePluginStatus(plugin);
    await fetchPluginChanged();
    message.success($t('ui.actionMessage.operationSuccess'));
  } catch (error) {
    console.error(error);
  }
};

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    try {
      const { valid } = await formApi.validate();
      if (!valid) return;
      modalApi.lock();
      formApi.form.values.installType === 0
        ? await installZipPluginApi(fileList.value[0])
        : await installGitPluginApi(formApi.form.values.repo_url);
      await modalApi.close();
      fileList.value = [];
      await formApi.resetForm();
      await fetchPlugin();
      await fetchPluginChanged();
    } catch (error) {
      console.error(error);
    } finally {
      modalApi.unlock();
    }
  },
});

onMounted(() => {
  fetchPluginChanged();
  fetchPlugin();
});
</script>

<template>
  <Page>
    <VbenButton @click="() => modalApi.open()">安装插件</VbenButton>
    <Modal title="安装插件">
      <Form />
    </Modal>
    <a-alert
      v-show="pluginChanged"
      class="mt-4"
      message="检测到插件状态存在变更，为了确保系统能够正常运行，请尽快联系系统管理员进行相关调整"
      type="warning"
      show-icon
    />
    <div class="mt-4">
      <!-- 网格容器 -->
      <div class="grid gap-6 lg:grid-cols-4">
        <a-card v-for="info in pluginInfo" :key="info.plugin.name">
          <template #title>
            {{ info.plugin.summary }}
            <span class="ml-1 text-sm">
              <span class="text-gray-500">@{{ info.plugin.author }}</span>
            </span>
          </template>
          <p>{{ info.plugin.description }}</p>
          <br />
          <template #extra>
            <a-switch
              v-model:checked="info.plugin.enable"
              checked-value="1"
              checked-children="启用"
              un-checked-children="禁用"
              @click="editPluginStatus(info.plugin.name)"
            />
          </template>
          <template #actions>
            <p>
              <span class="icon-[mingcute--version-line] -mb-1 h-5 w-5"></span>
              {{ info.plugin.version }}
            </p>
            <span @click="deleteConfirm(info.plugin.name)">
              <a-button size="small" danger>卸载</a-button>
            </span>
            <span @click="downloadConfirm(info.plugin.name)">
              <a-button size="small">打包</a-button>
            </span>
          </template>
        </a-card>
      </div>
    </div>
  </Page>
</template>
