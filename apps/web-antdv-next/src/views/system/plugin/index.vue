<script setup lang="ts">
import type { PluginResult } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { confirm, Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { downloadFileFromBlobPart } from '@vben/utils';

import { message } from 'antdv-next';

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
const localPluginChanged = ref(false);
const pluginInfo = ref<PluginResult[]>();
const pageLoading = ref(false);
const deletingPlugin = ref('');
const downloadingPlugin = ref('');
const switchingPlugin = ref('');
const showPluginChangedAlert = computed(() => {
  return pluginChanged.value || localPluginChanged.value;
});

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

const refreshPluginData = async (showLoading = false) => {
  if (showLoading) {
    pageLoading.value = true;
  }
  try {
    await Promise.all([fetchPluginChanged(), fetchPlugin()]);
    localPluginChanged.value = false;
  } finally {
    if (showLoading) {
      pageLoading.value = false;
    }
  }
};

const fileList = ref<any[]>([]);
type PluginEnableValue = '0' | '1';
type PluginSwitchValue = boolean | PluginEnableValue;

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
    downloadingPlugin.value = plugin;
    try {
      const res = await downloadPluginApi(plugin);
      downloadFileFromBlobPart({ fileName: `${plugin}.zip`, source: res });
      message.success('插件包已开始下载');
    } catch (error) {
      console.error(error);
    } finally {
      downloadingPlugin.value = '';
    }
  });
}

function deleteConfirm(plugin: string) {
  confirm({
    icon: 'warning',
    content: '确认删除此插件吗？',
  }).then(async () => {
    deletingPlugin.value = plugin;
    try {
      await uninstallPluginApi(plugin);
      message.success($t('ui.actionMessage.deleteSuccess'));
      await refreshPluginData();
    } catch (error) {
      console.error(error);
    } finally {
      deletingPlugin.value = '';
    }
  });
}

const editPluginStatus = async (
  info: PluginResult,
  checked: PluginSwitchValue,
) => {
  const plugin = info.plugin.name;
  const nextEnableValue: PluginEnableValue =
    checked === true || checked === '1' ? '1' : '0';
  switchingPlugin.value = plugin;
  try {
    await updatePluginStatus(plugin);
    info.plugin.enable = nextEnableValue;
    localPluginChanged.value = true;
    await fetchPluginChanged();
    message.success($t('ui.actionMessage.operationSuccess'));
  } catch (error) {
    console.error(error);
  } finally {
    switchingPlugin.value = '';
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
      message.success($t('ui.actionMessage.operationSuccess'));
      await modalApi.close();
      fileList.value = [];
      await formApi.resetForm();
      await refreshPluginData();
    } catch (error) {
      console.error(error);
    } finally {
      modalApi.unlock();
    }
  },
});

onMounted(() => {
  refreshPluginData(true);
});
</script>

<template>
  <Page>
    <div class="mb-4">
      <VbenButton @click="() => modalApi.open()">安装插件</VbenButton>
    </div>
    <Modal title="安装插件">
      <Form />
    </Modal>
    <a-spin class="block" :spinning="pageLoading">
      <a-alert
        v-if="showPluginChangedAlert"
        title="检测到插件状态存在变更，为了确保系统能够正常运行，请尽快联系系统管理员进行相关调整"
        type="warning"
        show-icon
      />
      <div class="mt-4">
        <div class="grid items-stretch gap-6 lg:grid-cols-4">
          <a-card
            v-for="info in pluginInfo"
            :key="info.plugin.name"
            class="flex h-full flex-col"
            :styles="{
              body: {
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                height: '100%',
              },
            }"
          >
            <template #title>
              {{ info.plugin.summary }}
              <span class="ml-1 text-sm">
                <span class="text-gray-500">@{{ info.plugin.author }}</span>
              </span>
            </template>
            <p class="mb-0 flex-1">{{ info.plugin.description }}</p>
            <template #extra>
              <a-switch
                :checked="info.plugin.enable"
                checked-value="1"
                un-checked-value="0"
                checked-children="启用"
                un-checked-children="禁用"
                :loading="switchingPlugin === info.plugin.name"
                @change="(checked) => editPluginStatus(info, checked)"
              />
            </template>
            <template #actions>
              <p>
                <span
                  class="icon-[mingcute--version-line] -mb-1 h-5 w-5"
                ></span>
                {{ info.plugin.version }}
              </p>
              <a-button
                size="small"
                danger
                :loading="deletingPlugin === info.plugin.name"
                @click="deleteConfirm(info.plugin.name)"
              >
                卸载
              </a-button>
              <a-button
                size="small"
                :loading="downloadingPlugin === info.plugin.name"
                @click="downloadConfirm(info.plugin.name)"
              >
                打包
              </a-button>
            </template>
          </a-card>
        </div>
      </div>
    </a-spin>
  </Page>
</template>
