<script setup lang="ts">
import type { PluginResult } from '#/api/plugin';

import { onMounted, ref } from 'vue';

import { confirm, Page, useVbenModal, VbenButton } from '@vben/common-ui';
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
} from '#/api/plugin';

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
    content: '确认打包并下载此插件吗？',
    icon: 'success',
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
    content: '确认删除此插件吗？',
    icon: 'error',
  }).then(async () => {
    try {
      await uninstallPluginApi(plugin);
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
    message.success('更新插件状态成功');
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
              <a-tag> v{{ info.plugin.version }} </a-tag>
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
            <p class="text-gray-500">@{{ info.plugin.author }}</p>
            <span
              class="cursor-pointer text-green-500 hover:opacity-80"
              @click="downloadConfirm(info.plugin.name)"
            >
              打包
            </span>
            <span
              class="cursor-pointer text-red-500 hover:opacity-80"
              @click="deleteConfirm(info.plugin.name)"
            >
              卸载
            </span>
          </template>
        </a-card>
      </div>
    </div>
  </Page>
</template>
