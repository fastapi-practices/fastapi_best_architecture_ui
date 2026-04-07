<script lang="ts" setup>
import type { SysUserResult } from '#/api';

import { computed, onMounted, ref, watch } from 'vue';

import { getSysUserListApi } from '#/api';

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
  options?: SelectOption[];
}

const props = withDefaults(defineProps<Props>(), {
  allowClear: true,
  disabled: false,
  mode: 'single',
  modelValue: undefined,
  options: undefined,
  placeholder: '搜索用户名或昵称',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value?: number | number[]): void;
}>();

const loading = ref(false);
const innerOptions = ref<SelectOption[]>([]);

const mergedOptions = computed(() => {
  const optionMap = new Map<number, SelectOption>();
  for (const option of props.options ?? []) {
    optionMap.set(option.value, option);
  }
  for (const option of innerOptions.value) {
    optionMap.set(option.value, option);
  }
  return [...optionMap.values()];
});

const selectValue = computed(() => {
  if (props.mode === 'multiple') {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  }
  return typeof props.modelValue === 'number' ? props.modelValue : undefined;
});

function userOptionLabel(
  user: Pick<SysUserResult, 'id' | 'nickname' | 'username'>,
) {
  return user.nickname ? `${user.nickname}（${user.username}）` : user.username;
}

function mergeUserOptions(
  users: Array<Pick<SysUserResult, 'id' | 'nickname' | 'username'>>,
) {
  const optionMap = new Map<number, SelectOption>();
  for (const option of innerOptions.value) {
    optionMap.set(option.value, option);
  }
  for (const user of users) {
    optionMap.set(user.id, {
      label: userOptionLabel(user),
      value: user.id,
    });
  }
  innerOptions.value = [...optionMap.values()];
}

async function searchUsers(keyword?: string) {
  if (props.options?.length) {
    return;
  }
  loading.value = true;
  try {
    const data = await getSysUserListApi({
      page: 1,
      size: 20,
      status: 1,
      username: keyword?.trim() || undefined,
    });
    mergeUserOptions(data.items);
  } finally {
    loading.value = false;
  }
}

async function ensureUserOptionsForIds(ids: number[]) {
  if (props.options?.length) {
    return;
  }
  const existingIds = new Set(
    mergedOptions.value.map((option) => option.value),
  );
  const missingIds = ids.filter((id) => !existingIds.has(id));
  if (missingIds.length === 0) {
    return;
  }
  loading.value = true;
  try {
    const data = await getSysUserListApi({
      page: 1,
      size: Math.max(missingIds.length * 2, 20),
      status: 1,
    });
    mergeUserOptions(
      data.items.filter((item: SysUserResult) => missingIds.includes(item.id)),
    );
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

watch(
  () => props.modelValue,
  async (value) => {
    const ids = Array.isArray(value)
      ? value.filter(
          (item): item is number =>
            typeof item === 'number' && Number.isFinite(item),
        )
      : (typeof value === 'number' && Number.isFinite(value)
        ? [value]
        : []);
    if (ids.length > 0) {
      await ensureUserOptionsForIds(ids);
    }
  },
  { immediate: true },
);

watch(
  () => props.options,
  () => {
    if (props.options?.length) {
      innerOptions.value = [];
    }
  },
);

onMounted(async () => {
  if (!props.options?.length) {
    await searchUsers();
  }
});
</script>

<template>
  <a-select
    :mode="mode === 'multiple' ? 'multiple' : undefined"
    :allow-clear="allowClear"
    :disabled="disabled"
    show-search
    :filter-option="false"
    :loading="loading"
    :value="selectValue"
    :options="mergedOptions"
    :placeholder="placeholder"
    @search="searchUsers"
    @focus="() => searchUsers()"
    @update:value="updateValue"
  />
</template>
