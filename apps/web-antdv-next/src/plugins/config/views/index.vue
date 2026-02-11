<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import Email from '#/plugins/config/views/email.vue';
import Login from '#/plugins/config/views/login.vue';
import UserSecurity from '#/plugins/config/views/user-security.vue';

const activeKey = ref('0');

const userSecurityRef = ref();
const loginRef = ref();
const emailRef = ref();

watch(activeKey, async (newValue) => {
  if (newValue === '0') {
    await nextTick();
    if (userSecurityRef.value) {
      await userSecurityRef.value.fetchConfigList();
    }
  }
  if (newValue === '1') {
    await nextTick();
    if (loginRef.value) {
      await loginRef.value.fetchConfigList();
    }
  }
  if (newValue === '2') {
    await nextTick();
    if (emailRef.value) {
      await emailRef.value.fetchConfigList();
    }
  }
});

onMounted(async () => {
  await nextTick();
  if (userSecurityRef.value) {
    await userSecurityRef.value.fetchConfigList();
  }
});
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
            <span class="icon-[carbon--security] -mb-1 size-5"></span>
            安全配置
          </template>
          <UserSecurity ref="userSecurityRef" />
        </a-tab-pane>
        <a-tab-pane key="1">
          <template #tab>
            <span class="icon-[majesticons--lock-line] -mb-1 size-5"></span>
            登录配置
          </template>
          <Login ref="loginRef" />
        </a-tab-pane>
        <a-tab-pane key="2">
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
