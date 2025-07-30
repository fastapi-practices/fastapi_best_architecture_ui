<script setup lang="ts">
import type {
  MyUserInfo,
  SysResetPasswordParams,
  SysUpdateUserEmailParams,
  SysUpdateUserPhoneParams,
} from '#/api';

import { computed } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  bindSysUserEmailApi,
  bindSysUserPhoneApi,
  updateSysUserPasswordApi,
} from '#/api';
import { getPhoneCaptchaApi } from '#/plugins/aliyun_sms/api';
import { getEmailCaptchaApi } from '#/plugins/email/api';
import { useAuthStore } from '#/store';

import { emailSchema, passwordSchema, phoneSchema } from './data';

const props = defineProps<{ userinfo?: MyUserInfo }>();

const securityOptions = computed(() => [
  {
    class: 'icon-[fluent--phone-48-regular] mt-1.5',
    title: '安全手机',
    description: '手机号可用于登录、身份验证、密码找回、通知接收',
    type: 'phone',
    status: !!props.userinfo?.phone,
    statusString: props.userinfo?.phone ? '已绑定' : '未绑定',
  },
  {
    class: 'icon-[ic--outline-email] mt-1.5',
    title: '安全邮箱',
    description: '邮箱可用于登录、身份验证、密码找回、通知接收',
    type: 'email',
    status: !!props.userinfo?.email,
    statusString: props.userinfo?.email ? '已绑定' : '未绑定',
  },
  {
    class: 'icon-[mdi--password-outline] mt-1.5',
    title: '登录密码',
    description: '为了您的账号安全，建议定期修改密码',
    type: 'password',
    status: true,
    statusString: '已设置',
  },
]);

const sendPhoneCode = async (phone: string) => {
  try {
    await getPhoneCaptchaApi({ phone });
  } catch (error) {
    console.error(error);
  }
};

const [phoneForm, phoneFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: phoneSchema(sendPhoneCode),
});

const [phoneModal, phoneModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await phoneFormApi.validate();
    if (valid) {
      phoneModalApi.lock();
      const data = await phoneFormApi.getValues<SysUpdateUserPhoneParams>();
      try {
        await bindSysUserPhoneApi(props.userinfo?.id || 0, data);
        await phoneModalApi.close();
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

const sendEmailCode = async (email: string) => {
  try {
    await getEmailCaptchaApi({ email });
  } catch (error) {
    console.error(error);
  }
};

const [emailForm, emailFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: emailSchema(sendEmailCode),
});

const [emailModal, emailModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await emailFormApi.validate();
    if (valid) {
      emailModalApi.lock();
      const data = await emailFormApi.getValues<SysUpdateUserEmailParams>();
      try {
        await bindSysUserEmailApi(props.userinfo?.id || 0, data);
        await emailModalApi.close();
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

const authStore = useAuthStore();
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
      const data = await passwordFormApi.getValues<SysResetPasswordParams>();
      try {
        await updateSysUserPasswordApi(props.userinfo?.id || 0, data);
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
  <a-list :data-source="securityOptions" :split="false" class="-ml-4">
    <template #renderItem="{ item }">
      <a-list-item>
        <template #actions>
          <VbenButton
            :variant="item.status ? 'outline' : 'default'"
            @click="openModal(item.type)"
          >
            {{ item.status ? '修改' : '绑定' }}
          </VbenButton>
        </template>
        <a-list-item-meta :description="item.description">
          <template #avatar>
            <a-avatar size="large">
              <template #icon>
                <span :class="item.class"></span>
              </template>
            </a-avatar>
          </template>
          <template #title>
            {{ item.title }}
            <span
              class="ml-2 text-xs"
              :class="item.status ? 'text-green-500' : 'text-orange-500'"
            >
              {{ item.statusString }}
            </span>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
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
