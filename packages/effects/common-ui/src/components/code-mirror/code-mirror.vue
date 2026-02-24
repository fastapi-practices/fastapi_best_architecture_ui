<script setup lang="ts">
import type { LanguageSupport } from './data';

import { computed, nextTick, ref, watch } from 'vue';
import CodeMirror from 'vue-codemirror6';

import { usePreferences } from '@vben-core/preferences';

import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

import { languageSupportMap } from './data';

const props = withDefaults(
  defineProps<{
    /**
     * 语言
     */
    language?: LanguageSupport;
    /**
     * 只读
     */
    readonly?: boolean;
  }>(),
  {
    language: 'python',
    readonly: false,
  },
);

const { isDark } = usePreferences();

const modelValue = defineModel({ default: '', type: String });

const lang = computed(() => languageSupportMap[props.language] ?? python());

const langChanged = ref(true);

const extensions = [oneDark];

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
    v-model="modelValue"
    :dark="isDark"
    :extensions="extensions"
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
