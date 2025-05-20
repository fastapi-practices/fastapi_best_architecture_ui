<script setup lang="ts">
import type { PluginResult } from '#/api/plugin';

import { h, ref } from 'vue';

import {
  confirm,
  Page,
  useVbenForm,
  useVbenModal,
  VbenButton,
} from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { Button } from 'ant-design-vue';

import {
  buildPluginApi,
  getPluginChangedApi,
  getPluginListApi,
  installGitPluginApi,
  installZipPluginApi,
  uninstallPluginApi,
  updatePluginStatus,
} from '#/api/plugin';

const pluginChanged = ref<boolean>(false);
const pluginInfo = ref<PluginResult[]>();

const fetchPluginChanged = async () => {
  try {
    pluginChanged.value = await getPluginChangedApi();
  } catch (error) {
    console.error(error);
  }
};
fetchPluginChanged();

const fetchPlugin = async () => {
  try {
    pluginInfo.value = await getPluginListApi();
  } catch (error) {
    console.error(error);
  }
};
fetchPlugin();

const fileList = ref<any[]>([]);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  wrapperClass: 'mt-8',
  schema: [
    {
      component: 'RadioGroup',
      defaultValue: 0,
      componentProps: {
        options: [
          {
            label: '压缩包',
            value: 0,
          },
          {
            label: 'GIT',
            value: 1,
          },
        ],
      },
      fieldName: 'installType',
      label: '安装方式',
    },
    {
      component: 'Upload',
      dependencies: {
        show: (values) => values && values.installType === 0,
        triggerFields: ['installType'],
      },
      componentProps: {
        name: 'file',
        accept: '.zip',
        maxCount: 1,
        multiple: false,
        directory: false,
        fileList: fileList.value,
        beforeUpload: (file: any) => {
          fileList.value = [file];
          return false;
        },
        onRemove: () => {
          fileList.value = [];
        },
      },
      renderComponentContent: () => ({
        default: () => {
          return h(Button, {}, { default: () => 'Upload' });
        },
      }),
      fieldName: 'uploadField',
      label: 'ZIP 压缩包',
      rules: 'required',
      help: '仅能上传一个 zip 压缩包文件，支持重新上传',
    },
    {
      component: 'Input',
      dependencies: {
        show: (values) => values && values.installType === 1,
        triggerFields: ['installType'],
      },
      fieldName: 'repo_url',
      label: 'GIT 仓库地址',
      rules: 'required',
    },
  ],
});

function downloadConfirm(plugin: string) {
  confirm({
    content: '确认打包并下载此插件吗？',
    icon: 'success',
  }).then(async () => {
    try {
      const res = await buildPluginApi(plugin);
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
    } catch (error) {
      console.error(error);
    }
  });
}

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

const editPluginStatus = async (plugin: string) => {
  try {
    await updatePluginStatus(plugin);
    await fetchPlugin();
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <Page>
    <div>
      <VbenButton @click="() => modalApi.open()">安装插件</VbenButton>
      <Modal title="安装插件">
        <Form />
      </Modal>
    </div>
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
            <span class="text-sm text-gray-500">
              @{{ info.plugin.author }}
            </span>
          </template>
          <p>{{ info.plugin.description }}</p>
          <br />
          <template #extra>
            <a-switch
              v-model:checked="info.plugin.enable"
              checked-value="1"
              @click="editPluginStatus(info.plugin.name)"
            />
          </template>
          <template #actions>
            <p class="text-sm text-gray-500">
              {{ info.plugin.version }}
            </p>
            <span
              class="icon-[material-symbols--download] cursor-pointer text-green-500 hover:opacity-80"
              @click="downloadConfirm(info.plugin.name)"
            ></span>
            <span
              class="icon-[material-symbols--delete] cursor-pointer text-red-500 hover:opacity-80"
              @click="deleteConfirm(info.plugin.name)"
            ></span>
          </template>
        </a-card>
      </div>
    </div>
  </Page>
</template>
