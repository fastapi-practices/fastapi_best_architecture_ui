<script setup lang="ts">
import type { ToolbarNames } from 'md-editor-v3';

import { computed } from 'vue';

import { usePreferences } from '@vben-core/preferences';

import { MdEditor } from 'md-editor-v3';

import 'md-editor-v3/lib/style.css';

interface Props {
  height?: number | string;
  id?: string;
  disabled?: boolean;
  toolbars?: ToolbarNames[];
  toolbarsExclude?: ToolbarNames[];
  noUploadImg?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  height: 'auto',
  id: '',
  disabled: false,
  toolbars: undefined,
  toolbarsExclude: () => [
    'github',
    'fullscreen',
    'pageFullscreen',
    'catalog',
    'htmlPreview',
  ],
  noUploadImg: true,
});

const emit = defineEmits<{
  mounted: [];
}>();

const { isDark } = usePreferences();

const content = defineModel('value', {
  type: String,
  default: '',
});

const theme = computed(() => (isDark.value ? 'dark' : 'light'));

const editorStyle = computed(() => {
  if (props.height === 'auto') {
    return {};
  }
  return {
    height:
      typeof props.height === 'number' ? `${props.height}px` : props.height,
  };
});

function onMounted() {
  emit('mounted');
}
</script>

<template>
  <MdEditor
    v-model="content"
    :id="id || undefined"
    :theme="theme"
    language="zh-CN"
    :style="editorStyle"
    :disabled="disabled"
    :toolbars="toolbars"
    :toolbars-exclude="toolbarsExclude"
    :no-upload-img="noUploadImg"
    :footers="[]"
    no-mermaid
    no-katex
    no-highlight
    @on-mounted="onMounted"
  />
</template>
