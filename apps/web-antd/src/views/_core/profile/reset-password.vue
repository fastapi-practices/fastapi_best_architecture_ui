<script setup lang="ts">
import type { SysResetPasswordParams } from '#/api';

import { ref } from 'vue';

import { confirm, VbenButton } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { updateSysUserPasswordApi } from '#/api';
import { useAuthStore } from '#/store';

import { schema } from './data';

const props = defineProps<{ id: number }>();

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema,
});

const authStore = useAuthStore();
const buttonDisabled = ref<boolean>(false);
const buttonLoading = ref<boolean>(false);

const resetPassword = async () => {
  const { valid } = await formApi.validate();
  if (valid) {
    confirm({
      title: '提示',
      content: '确定修改密码吗？',
      icon: 'warning',
    }).then(async () => {
      buttonLoading.value = true;
      const data = await formApi.getValues<SysResetPasswordParams>();
      try {
        await updateSysUserPasswordApi(props.id, data);
        await authStore.logout(false);
      } catch (error) {
        console.error(error);
      } finally {
        buttonLoading.value = false;
      }
    });
  }
};
</script>

<template>
  <Form />
  <VbenButton
    :disabled="buttonDisabled"
    :loading="buttonLoading"
    @click="resetPassword"
  >
    修改密码
  </VbenButton>
</template>
