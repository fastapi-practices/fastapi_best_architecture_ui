<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';

import { usePreferences } from '@vben-core/preferences';

import Vditor from 'vditor';

import 'vditor/dist/index.css';

interface Props {
  height?: number | string;
  options?: IOptions;
}

const props = withDefaults(defineProps<Props>(), {
  height: 'auto',
  options: () => ({}),
});

const emit = defineEmits<{
  mounted: [];
}>();

const { isDark, locale } = usePreferences();

const vditorRef = useTemplateRef('vditorRef');

const vditorInstance = shallowRef<null | Vditor>(null);

watch(isDark, (dark) => {
  const theme = dark ? 'dark' : 'light';
  vditorInstance.value?.setTheme(dark ? 'dark' : 'classic', theme, theme);
});

const content = defineModel('value', {
  type: String,
  default: '',
});

watch(content, (value) => {
  vditorInstance.value?.setValue(value);
});

onMounted(() => {
  vditorInstance.value = new Vditor(vditorRef.value!, {
    mode: 'wysiwyg',
    value: content.value,
    height: props.height,
    width: '100%',
    lang: locale.value.replace('-', '_') as any,
    cache: {
      enable: false,
    },
    theme: isDark.value ? 'dark' : 'classic',
    // 预览(只读模式) 不显示工具栏
    toolbar: [],
    // 加载完成的事件
    after() {
      emit('mounted');
      // 禁用编辑器
      vditorInstance.value?.disabled();
    },
    ...props.options,
  });
});

onBeforeUnmount(() => {
  vditorInstance.value?.destroy();
  vditorInstance.value = null;
});
</script>

<template>
  <div ref="vditorRef"></div>
</template>

<style>
.vditor-wysiwyg pre.vditor-reset[contenteditable='false'] {
  cursor: unset;
  opacity: 1;
}

/**
dark模式样式需要重置
*/
.vditor--dark .vditor-reset {
  color: #d1d5da;
}
</style>
