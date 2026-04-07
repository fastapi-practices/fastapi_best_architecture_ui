<script lang="ts" setup>
import type { SysRoleResult } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { getAllSysRoleApi } from '#/api';

interface SelectOption {
  label: string;
  value: number;
}

interface Props {
  modelValue?: null | number | number[];
  mode?: 'multiple' | 'single';
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  allowClear: true,
  disabled: false,
  mode: 'multiple',
  modelValue: undefined,
  placeholder: '搜索并选择角色',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value?: number | number[]): void;
}>();

const loading = ref(false);
const options = ref<SelectOption[]>([]);

const selectValue = computed(() => {
  if (props.mode === 'multiple') {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  }
  return typeof props.modelValue === 'number' ? props.modelValue : undefined;
});

async function loadRoles() {
  loading.value = true;
  try {
    const roles = await getAllSysRoleApi();
    options.value = roles.map((role: SysRoleResult) => ({
      label: role.name,
      value: role.id,
    }));
  } finally {
    loading.value = false;
  }
}

function normalizeSingleValue(value: unknown) {
  if (Array.isArray(value)) {
    return normalizeSingleValue(value[0]);
  }
  if (value === null || value === undefined || value === '') {
    emit('update:modelValue', undefined);
    return;
  }
  const normalizedValue = Number(value);
  emit(
    'update:modelValue',
    Number.isFinite(normalizedValue) ? normalizedValue : undefined,
  );
}

function normalizeMultipleValue(value: unknown) {
  const normalizedValue = Array.isArray(value)
    ? value.map(Number).filter((item) => Number.isFinite(item))
    : [];
  emit('update:modelValue', normalizedValue);
}

function updateValue(value: unknown) {
  if (props.mode === 'multiple') {
    normalizeMultipleValue(value);
    return;
  }
  normalizeSingleValue(value);
}

onMounted(loadRoles);
</script>

<template>
  <a-select
    :mode="mode === 'multiple' ? 'multiple' : undefined"
    :allow-clear="allowClear"
    :disabled="disabled"
    show-search
    :loading="loading"
    :value="selectValue"
    :options="options"
    :placeholder="placeholder"
    @update:value="updateValue"
  />
</template>
