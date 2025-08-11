<script setup lang="ts">
import type { Key } from 'ant-design-vue/es/vc-tree/interface';

import type { Component } from 'vue';

import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { CodeMirror, ColPage, useVbenModal } from '@vben/common-ui';
import {
  BxsFile,
  FlatColorIconsFolder,
  MaterialIconThemePython,
} from '@vben/icons';
import { $t } from '@vben/locales';

import { useClipboard } from '@vueuse/core';
import { message } from 'ant-design-vue';

import { previewCodeGenApi } from '#/plugins/code_generator/api';

interface TreeNode {
  children: TreeNode[];
  title: string;
  key: string;
  icon: Component;
}

const treeData = ref<TreeNode[]>([]);
const codes = ref<null | Recordable<any>>(null);
const language = ref<string>('html');
const modalTitle = ref<string>('代码预览');
const codeContent = ref<string>('点击左侧树节点查看代码');

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  fullscreen: true,
  fullscreenButton: false,
  footer: false,
  contentClass: 'p-0',
  async onOpenChange(isOpen) {
    if (!isOpen) {
      codes.value = null;
      language.value = 'html';
      modalTitle.value = '代码预览';
      codeContent.value = '点击左侧树节点查看代码';
      return null;
    }

    try {
      const res = await previewCodeGenApi(modalApi.getData().pk);
      codes.value = res;
      treeData.value = convertToTree(Object.keys(res));
    } catch (error) {
      console.error(error);
    }
  },
});

/**
 * 文件路径数组转树结构
 * @param paths 文件路径数组
 */
function convertToTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  for (const path of paths) {
    const segments = path.split('/');
    let parentPath = '';
    let parentChildren = root;

    for (const [i, segment] of segments.entries()) {
      parentPath = i === 0 ? segment : `${parentPath}/${segment}`;
      let node = nodeMap.get(parentPath);

      if (!node) {
        node = {
          icon: findIcon(parentPath),
          key: parentPath,
          title: segment,
          children: [],
        };
        parentChildren.push(node);
        nodeMap.set(parentPath, node);
      }

      parentChildren = node.children;
    }
  }

  return root;
}

const defaultFileIcon = BxsFile;
const defaultFolderIcon = FlatColorIconsFolder;
const iconMap: Record<string, any> = {
  py: MaterialIconThemePython,
};

function findIcon(path: string) {
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex !== -1) {
    const ext = path.slice(dotIndex + 1);
    return iconMap[ext] || defaultFileIcon;
  }
  return defaultFolderIcon;
}

function handleSelect(selectedKeys: Key[]) {
  const [currentFile = ''] = selectedKeys as string[];
  const currentCode = codes.value?.[currentFile];
  if (!currentCode) return;

  changeLanguageType(currentFile);
  modalTitle.value = `代码预览: ${currentFile}`;
  codeContent.value = currentCode;
}

const typeMap: Record<string, string> = {
  '.py': 'python',
};

function changeLanguageType(filename: string) {
  const lang = Object.entries(typeMap).find(([ext]) => filename.endsWith(ext));
  language.value = lang ? lang[1] : 'html';
}

const { copy } = useClipboard({ legacy: true });

function copyCodeContent(code: string) {
  copy(code);
  message.success($t('preferences.copyPreferencesSuccessTitle'));
}
</script>

<template>
  <Modal :title="modalTitle">
    <div v-if="codes">
      <ColPage
        auto-content-height
        :height-offset="-35"
        :resizable="false"
        :left-width="20"
        :right-width="80"
      >
        <template #left>
          <div class="mr-2 h-full overflow-y-auto">
            <a-tree
              v-if="treeData.length > 0"
              :show-line="{ showLeafIcon: false }"
              :tree-data="treeData"
              :virtual="false"
              default-expand-all
              @select="handleSelect"
            >
              <template #title="{ title, icon }">
                <div class="flex items-center gap-[8px]">
                  <component :is="icon" />
                  <span>{{ title }}</span>
                </div>
              </template>
            </a-tree>
          </div>
        </template>
        <CodeMirror
          class="h-full overflow-y-scroll text-[13px]"
          v-model="codeContent"
          :language="language"
        />
        <a-button
          class="fixed right-16 top-24"
          @click="copyCodeContent(codeContent)"
        >
          复制
        </a-button>
      </ColPage>
    </div>
    <a-skeleton v-else active />
  </Modal>
</template>

<style lang="scss" scoped>
/** codeMirror 占满容器高度 即 calc 计算的高度 */
:deep(.cm-editor) {
  height: 100%;
}
</style>
