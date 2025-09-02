<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import CodeMirror from 'vue-codemirror6';

import { usePreferences } from '@vben-core/preferences';

import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
  /**
   * 语言
   */
  language?: string;
  /**
   * 只读
   */
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'python',
  readonly: true,
});

const { isDark } = usePreferences();

const codeMirrorRef =
  useTemplateRef<InstanceType<typeof CodeMirror>>('codeMirrorRef');

const modelValue = defineModel({ default: '', type: String });

const lang = computed(() => python());

const langChanged = ref(true);

watch(
  () => props.language,
  () => {
    langChanged.value = false;
    nextTick(() => (langChanged.value = true));
  },
);
</script>

<template>
  <CodeMirror
    v-if="langChanged"
    v-bind="$attrs"
    ref="codeMirrorRef"
    v-model="modelValue"
    :dark="isDark"
    :extensions="[oneDark]"
    :lang="lang"
    :readonly="props.readonly"
    basic
    wrap
  >
    <template v-for="slotName in Object.keys($slots)" #[slotName]="scope">
      <slot :name="slotName" v-bind="scope ?? {}"></slot>
    </template>
  </CodeMirror>
</template>
