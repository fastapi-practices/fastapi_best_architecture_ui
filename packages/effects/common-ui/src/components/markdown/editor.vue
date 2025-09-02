<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';

import { usePreferences } from '@vben-core/preferences';

import Vditor from 'vditor';

import 'vditor/dist/index.css';

interface Props {
  height?: number | string;
  mode?: 'ir' | 'sv' | 'wysiwyg';
  id?: string;
  enableCache?: boolean;
  disabled?: boolean;
  options?: IOptions;
}

const props = withDefaults(defineProps<Props>(), {
  height: 'auto',
  mode: 'wysiwyg',
  // 编辑器唯一ID 缓存使用 可记录上次输入
  id: '',
  enableCache: false,
  disabled: false,
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

const isInternalUpdate = ref(false);

watch(content, (value) => {
  if (isInternalUpdate.value) {
    isInternalUpdate.value = false;
    return;
  }
  vditorInstance.value?.setValue(value);
});

function changeDisabled(disabled: boolean) {
  if (disabled) {
    vditorInstance.value?.disabled();
  } else {
    vditorInstance.value?.enable();
  }
}

watch(() => props.disabled, changeDisabled);

watch(
  () => props.enableCache,
  (newVal) => {
    if (newVal && !props.id) {
      console.warn('The id is required when enableCache is true');
    }
  },
);

onMounted(() => {
  vditorInstance.value = new Vditor(vditorRef.value!, {
    mode: props.mode,
    value: content.value,
    height: props.height,
    minHeight: 350,
    width: '100%',
    lang: locale.value.replace('-', '_') as any,
    cache: {
      enable: props.enableCache,
      id: props.id,
    },
    theme: isDark.value ? 'dark' : 'classic',
    // 手动响应式
    input(value) {
      isInternalUpdate.value = true;
      content.value = value;
    },
    // 加载完成的事件
    after() {
      changeDisabled(props.disabled);
      emit('mounted');
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
