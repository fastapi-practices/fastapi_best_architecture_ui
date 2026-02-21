<script setup lang="ts">
import { computed } from 'vue';

import { usePreferences } from '@vben-core/preferences';

import { MdPreview } from 'md-editor-v3';

import 'md-editor-v3/lib/preview.css';

interface Props {
  height?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  height: 'auto',
});

const { isDark } = usePreferences();

const content = defineModel('value', {
  type: String,
  default: '',
});

const theme = computed(() => (isDark.value ? 'dark' : 'light'));

const previewStyle = computed(() => {
  if (props.height === 'auto') {
    return {};
  }
  return {
    height:
      typeof props.height === 'number' ? `${props.height}px` : props.height,
  };
});
</script>

<template>
  <MdPreview
    v-model="content"
    :theme="theme"
    language="zh-CN"
    :style="previewStyle"
  />
</template>
