<script setup lang="ts">
import type { MyUserInfo } from '#/api';

const props = defineProps<{ userinfo?: MyUserInfo }>();
</script>

<template>
  <a-card
    class="mr-3"
    title="基本信息"
    :head-style="{
      borderBottom: 'none',
    }"
  >
    <div class="mb-8 mt-2 text-center">
      <a-avatar
        v-if="props.userinfo?.avatar"
        :size="128"
        :src="props.userinfo?.avatar"
      />
      <a-avatar v-else class="bg-green-800" :size="128">
        <p class="mt-8 text-5xl">{{ props.userinfo?.username[0] }}</p>
      </a-avatar>
      <p class="mt-3 text-lg">{{ props.userinfo?.nickname }}</p>
      <div class="mt-3 flex items-center justify-center gap-2">
        <span
          class="icon-[ix--id-filled]"
          style="width: 1.2em; height: 1.2em"
        ></span>
        <p class="text-sm text-gray-500">{{ props.userinfo?.id }}</p>
      </div>
    </div>
    <a-descriptions class="ml-6" :column="1">
      <a-descriptions-item label="用户名">
        {{ props.userinfo?.username }}
      </a-descriptions-item>
      <a-descriptions-item label="手机">
        {{ props.userinfo?.phone || '暂无' }}
      </a-descriptions-item>
      <a-descriptions-item label="邮箱">
        {{ props.userinfo?.email }}
      </a-descriptions-item>
      <a-descriptions-item label="部门">
        <span v-if="props.userinfo?.dept">
          <a-tag :key="props.userinfo?.dept" color="green">
            {{ props.userinfo?.dept }}
          </a-tag>
        </span>
        <span v-else>未绑定</span>
      </a-descriptions-item>
      <a-descriptions-item label="角色">
        <div class="flex flex-wrap gap-2">
          <a-tag
            v-for="role in props.userinfo?.roles"
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
      最后登录时间：{{ props.userinfo?.last_login_time }}
    </template>
  </a-card>
</template>
