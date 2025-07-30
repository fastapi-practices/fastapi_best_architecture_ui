<script setup lang="ts">
import type { MyUserInfo } from '#/api';

import { onMounted, ref } from 'vue';

import { ColPage } from '@vben/common-ui';

import { getUserInfoApi } from '#/api';
import ComingSoon from '#/views/_core/fallback/coming-soon.vue';
import BasicInfo from '#/views/_core/profile/basic-info.vue';
import OnlineDevice from '#/views/_core/profile/online-device.vue';
import Security from '#/views/_core/profile/security.vue';

const userinfo = ref<MyUserInfo>();
const tabList = [
  {
    key: '0',
    tab: '安全设置',
  },
  {
    key: '1',
    tab: '第三方账号',
  },
  {
    key: '2',
    tab: '在线设备',
  },
];
const tabKey = ref<string>('0');

const fetchUserInfo = async () => {
  try {
    userinfo.value = await getUserInfoApi();
  } catch (error) {
    console.error(error);
  }
};

const onTabChange = (value: string) => {
  tabKey.value = value;
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<template>
  <ColPage
    auto-content-height
    :resizable="false"
    :left-width="30"
    :right-width="70"
  >
    <template #left>
      <BasicInfo :userinfo="userinfo" />
    </template>
    <a-card
      :head-style="{
        borderBottom: 'none',
      }"
      :tab-list="tabList"
      :active-tab-key="tabKey"
      @tab-change="(key: string) => onTabChange(key)"
    >
      <div v-if="tabKey === '0'">
        <Security :userinfo="userinfo" />
      </div>
      <div v-else-if="tabKey === '1'">
        <ComingSoon />
      </div>
      <div v-else>
        <OnlineDevice :username="userinfo?.username || ''" />
      </div>
    </a-card>
  </ColPage>
</template>
