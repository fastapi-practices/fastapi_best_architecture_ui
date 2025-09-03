<script setup lang="ts">
import { ref } from 'vue';

import { ColPage } from '@vben/common-ui';

import ComingSoon from '#/views/_core/fallback/coming-soon.vue';
import BasicInfo from '#/views/_core/profile/basic-info.vue';
import OnlineDevice from '#/views/_core/profile/online-device.vue';
import Security from '#/views/_core/profile/security.vue';

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

const onTabChange = (value: string) => {
  tabKey.value = value;
};
</script>

<template>
  <ColPage
    auto-content-height
    :resizable="false"
    :left-width="30"
    :right-width="70"
  >
    <template #left>
      <div class="mr-3">
        <BasicInfo />
      </div>
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
        <Security />
      </div>
      <div v-else-if="tabKey === '1'">
        <ComingSoon />
      </div>
      <div v-else>
        <OnlineDevice />
      </div>
    </a-card>
  </ColPage>
</template>
