<script setup lang="ts">
import type {
  SysUpdatePasswordParams,
  SysUpdateUserEmailParams,
  SysUpdateUserPhoneParams,
} from '#/api';

import { computed } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';
import { useUserStore } from '@vben/stores';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  updateSysUserEmailApi,
  updateSysUserPasswordApi,
  updateSysUserPhoneApi,
} from '#/api';
import { useAuthStore } from '#/store';

import { emailSchema, passwordSchema, phoneSchema } from './data';

const authStore = useAuthStore();
const userStore = useUserStore();
const PhoneIcon = createIconifyIcon('fluent:phone-48-regular');
const EmailIcon = createIconifyIcon('ic:outline-email');
const PasswordIcon = createIconifyIcon('mdi:password-outline');

const securityOptions = computed(() => [
  {
    icon: PhoneIcon,
    title: '安全手机',
    description: '手机号可用于登录、身份验证、密码找回、通知接收',
    type: 'phone',
    status: !!userStore.userInfo?.phone,
    statusString: userStore.userInfo?.phone ? '已绑定' : '未绑定',
  },
  {
    icon: EmailIcon,
    title: '安全邮箱',
    description: '邮箱可用于登录、身份验证、密码找回、通知接收',
    type: 'email',
    status: !!userStore.userInfo?.email,
    statusString: userStore.userInfo?.email ? '已绑定' : '未绑定',
  },
  {
    icon: PasswordIcon,
    title: '登录密码',
    description: '为了您的账号安全，建议定期修改密码',
    type: 'password',
    status: true,
    statusString: '已设置',
  },
]);

const [phoneForm, phoneFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: phoneSchema,
});

const [phoneModal, phoneModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await phoneFormApi.validate();
    if (valid) {
      phoneModalApi.lock();
      const data = await phoneFormApi.getValues<SysUpdateUserPhoneParams>();
      try {
        await updateSysUserPhoneApi(data);
        message.success('手机号更新成功');
        await phoneModalApi.close();
        await authStore.fetchUserInfo();
      } finally {
        phoneModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = phoneModalApi.getData();
      phoneFormApi.resetForm();
      if (data) {
        phoneFormApi.setValues(data);
      }
    }
  },
});

const [emailForm, emailFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: emailSchema,
});

const [emailModal, emailModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await emailFormApi.validate();
    if (valid) {
      emailModalApi.lock();
      const data = await emailFormApi.getValues<SysUpdateUserEmailParams>();
      try {
        await updateSysUserEmailApi(data);
        message.success('邮箱更新成功');
        await emailModalApi.close();
        await authStore.fetchUserInfo();
      } finally {
        emailModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = emailModalApi.getData();
      emailFormApi.resetForm();
      if (data) {
        emailFormApi.setValues(data);
      }
    }
  },
});

const [passwordForm, passwordFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: passwordSchema,
});

const [passwordModal, passwordModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await passwordFormApi.validate();
    if (valid) {
      passwordModalApi.lock();
      const data = await passwordFormApi.getValues<SysUpdatePasswordParams>();
      try {
        await updateSysUserPasswordApi(data);
        message.success('密码更新成功，请重新登录');
        await passwordModalApi.close();
        await authStore.logout(false);
      } finally {
        passwordModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = passwordModalApi.getData();
      passwordFormApi.resetForm();
      if (data) {
        passwordFormApi.setValues(data);
      }
    }
  },
});

const openModal = (type: string) => {
  if (type === 'phone') {
    phoneModalApi.setData(null).open();
  }
  if (type === 'email') {
    emailModalApi.setData(null).open();
  }
  if (type === 'password') {
    passwordModalApi.setData(null).open();
  }
};
</script>

<template>
  <div class="-ml-4">
    <div
      v-for="(item, index) in securityOptions"
      :key="index"
      class="flex items-center justify-between px-4 py-3"
    >
      <div class="flex items-center gap-4">
        <a-avatar size="large">
          <template #icon>
            <component :is="item.icon" class="size-5" />
          </template>
        </a-avatar>
        <div>
          <div>
            {{ item.title }}
            <span
              class="ml-2 text-xs"
              :class="item.status ? 'text-green-500' : 'text-orange-500'"
            >
              {{ item.statusString }}
            </span>
          </div>
          <div class="text-sm text-gray-500">{{ item.description }}</div>
        </div>
      </div>
      <VbenButton
        :variant="item.status ? 'outline' : 'default'"
        @click="openModal(item.type)"
      >
        {{ item.status ? '修改' : '绑定' }}
      </VbenButton>
    </div>
  </div>
  <phoneModal title="绑定手机号">
    <phoneForm />
  </phoneModal>
  <emailModal title="绑定邮箱">
    <emailForm />
  </emailModal>
  <passwordModal title="重置密码">
    <passwordForm />
  </passwordModal>
</template>
