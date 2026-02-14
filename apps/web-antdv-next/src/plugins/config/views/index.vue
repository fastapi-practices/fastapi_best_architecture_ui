<script setup lang="ts">
import { h, nextTick, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import Email from '#/plugins/config/views/email.vue';
import Login from '#/plugins/config/views/login.vue';
import UserSecurity from '#/plugins/config/views/user-security.vue';

const activeKey = ref('0');

const userSecurityRef = ref();
const loginRef = ref();
const emailRef = ref();

const tabItems = [
  {
    key: '0',
    label: '安全配置',
    icon: () => h('span', { class: 'icon-[carbon--security] -mb-1 size-5' }),
  },
  {
    key: '1',
    label: '登录配置',
    icon: () =>
      h('span', { class: 'icon-[majesticons--lock-line] -mb-1 size-5' }),
  },
  {
    key: '2',
    label: '邮件配置',
    icon: () => h('span', { class: 'icon-[ic--outline-email] -mb-1 size-5' }),
  },
];

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
      variant="borderless"
    >
      <a-tabs
        class="h-full"
        v-model:active-key="activeKey"
        tab-placement="start"
        animated
        :tab-bar-style="{ width: '16%' }"
        :items="tabItems"
      >
        <template #contentRender="{ item }">
          <UserSecurity v-if="item.key === '0'" ref="userSecurityRef" />
          <Login v-else-if="item.key === '1'" ref="loginRef" />
          <Email v-else-if="item.key === '2'" ref="emailRef" />
        </template>
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
