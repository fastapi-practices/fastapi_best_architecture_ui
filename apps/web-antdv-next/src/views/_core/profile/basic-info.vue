<script setup lang="ts">
import type {
  SysUpdateUserAvatarParams,
  SysUpdateUserNicknameParams,
} from '#/api';

import { useVbenModal } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { useVbenForm } from '#/adapter/form';
import { updateSysUserAvatarApi, updateSysUserNicknameApi } from '#/api';
import { useAuthStore } from '#/store';

import { avatarSchema, nicknameSchema } from './data';

const authStore = useAuthStore();
const userStore = useUserStore();

const [AvatarForm, avatarFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: avatarSchema,
});

const [avatarModal, avatarModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await avatarFormApi.validate();
    if (valid) {
      avatarModalApi.lock();
      const data = await avatarFormApi.getValues<SysUpdateUserAvatarParams>();
      try {
        await updateSysUserAvatarApi(data);
        await avatarModalApi.close();
        await authStore.fetchUserInfo();
      } finally {
        avatarModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = avatarModalApi.getData();
      avatarFormApi.resetForm();
      if (data) {
        avatarFormApi.setValues(data);
      }
    }
  },
});

const [NicknameForm, nicknameFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: nicknameSchema,
});

const [nicknameModal, nicknameModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await nicknameFormApi.validate();
    if (valid) {
      nicknameModalApi.lock();
      const data =
        await nicknameFormApi.getValues<SysUpdateUserNicknameParams>();
      try {
        await updateSysUserNicknameApi(data);
        await nicknameModalApi.close();
        await authStore.fetchUserInfo();
      } finally {
        nicknameModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = nicknameModalApi.getData();
      nicknameFormApi.resetForm();
      if (data) {
        nicknameFormApi.setValues(data);
      }
    }
  },
});
</script>

<template>
  <a-card
    title="基本信息"
    :head-style="{
      borderBottom: 'none',
    }"
  >
    <div class="mb-8 mt-2 text-center">
      <a-tooltip>
        <template #title>点击上传头像</template>
        <a-avatar
          class="cursor-pointer"
          :size="128"
          :src="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
          @click="avatarModalApi.setData(null).open()"
        />
      </a-tooltip>
      <p class="mt-5 text-lg">
        {{ userStore.userInfo?.nickname }}
        <a-button
          type="ghost"
          size="small"
          @click="nicknameModalApi.setData(null).open()"
        >
          <span class="icon-[cuida--edit-outline]"></span>
        </a-button>
      </p>
      <div class="mt-3 flex items-center justify-center gap-2">
        <span
          class="icon-[ix--id-filled]"
          style="width: 1.2em; height: 1.2em"
        ></span>
        <p class="text-sm text-gray-500">{{ userStore.userInfo?.id }}</p>
      </div>
    </div>
    <a-descriptions class="ml-6" :column="1">
      <a-descriptions-item label="用户名">
        {{ userStore.userInfo?.username }}
      </a-descriptions-item>
      <a-descriptions-item label="手机">
        {{ userStore.userInfo?.phone || '暂无' }}
      </a-descriptions-item>
      <a-descriptions-item label="邮箱">
        {{ userStore.userInfo?.email }}
      </a-descriptions-item>
      <a-descriptions-item label="部门">
        <span v-if="userStore.userInfo?.dept">
          <a-tag :key="userStore.userInfo?.dept" color="green">
            {{ userStore.userInfo?.dept }}
          </a-tag>
        </span>
        <span v-else>未绑定</span>
      </a-descriptions-item>
      <a-descriptions-item label="角色">
        <div class="flex flex-wrap gap-2">
          <a-tag
            v-for="role in userStore.userInfo?.roles"
            :key="role"
            color="purple"
            class="whitespace-nowrap"
          >
            {{ role }}
          </a-tag>
        </div>
      </a-descriptions-item>
    </a-descriptions>
    <template #actions>
      最后登录时间：{{ userStore.userInfo?.last_login_time }}
    </template>
  </a-card>
  <avatarModal title="更新头像">
    <AvatarForm />
  </avatarModal>
  <nicknameModal title="更新昵称">
    <NicknameForm />
  </nicknameModal>
</template>
