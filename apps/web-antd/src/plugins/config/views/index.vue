<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import Email from '#/plugins/config/views/email.vue';
import ComingSoon from '#/views/_core/fallback/coming-soon.vue';

const activeKey = ref('0');

const emailRef = ref();

watch(
  activeKey,
  async (newValue) => {
    if (newValue === '3') {
      await nextTick();
      if (emailRef.value) {
        await emailRef.value.fetchConfigList();
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <Page auto-content-height>
    <a-card
      class="h-full overflow-y-auto rounded-[var(--radius)]"
      :bordered="false"
    >
      <a-tabs
        class="h-full"
        v-model:active-key="activeKey"
        tab-position="left"
        animated
        :tab-bar-style="{ width: '16%' }"
      >
        <a-tab-pane key="0">
          <template #tab>
            <span class="icon-[mdi--web] -mb-1 size-5"></span>
            网站配置
          </template>
          <ComingSoon />
        </a-tab-pane>
        <a-tab-pane key="1">
          <template #tab>
            <span class="icon-[carbon--security] -mb-1 size-5"></span>
            安全配置
          </template>
          <ComingSoon />
        </a-tab-pane>
        <a-tab-pane key="2">
          <template #tab>
            <span class="icon-[majesticons--lock-line] -mb-1 size-5"></span>
            登录配置
          </template>
          <ComingSoon />
        </a-tab-pane>
        <a-tab-pane key="3">
          <template #tab>
            <span class="icon-[ic--outline-email] -mb-1 size-5"></span>
            邮件配置
          </template>
          <Email ref="emailRef" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </Page>
</template>

<style lang="scss" scoped>
:deep(.ant-card-body) {
  height: 100%;
  min-height: 100%;
}
</style>
