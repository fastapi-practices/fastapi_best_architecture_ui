<script setup lang="ts">
import type { OAuth2BindingParams } from '#/plugins/oauth2/api';

import { computed, onMounted, ref } from 'vue';

import { confirm } from '@vben/common-ui';
import { SvgGithubIcon, SvgGoogleIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import {
  deleteOAuth2Binding,
  getOAuth2BindingAuthUrl,
  getOAuth2Bindings,
} from '#/plugins/oauth2/api';

const bindings = ref<string[]>([]);
const loading = ref<boolean>(false);

const securityOptions = computed(() => [
  {
    source: 'Github' as const,
    description: '绑定 Github 账号',
    status: bindings.value?.includes('Github'),
    statusString: bindings.value?.includes('Github') ? '已绑定' : '未绑定',
  },
  {
    source: 'Google' as const,
    description: '绑定 Google 账号',
    status: bindings.value?.includes('Google'),
    statusString: bindings.value?.includes('Google') ? '已绑定' : '未绑定',
  },
]);

const getBindings = async () => {
  loading.value = true;
  try {
    bindings.value = await getOAuth2Bindings();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const OAuth2Binding = async (ob: OAuth2BindingParams) => {
  try {
    switch (ob.source) {
      case 'Github': {
        window.location.href = await getOAuth2BindingAuthUrl({
          source: ob.source,
        });
        break;
      }
      case 'Google': {
        window.location.href = await getOAuth2BindingAuthUrl({
          source: ob.source,
        });
        break;
      }
      // No default
    }
  } catch (error) {
    console.error(error);
  }
};

function deleteConfirm(ob: OAuth2BindingParams) {
  confirm({
    icon: 'warning',
    content: '确认解绑此账号吗？',
  }).then(async () => {
    try {
      await deleteOAuth2Binding({ source: ob.source });
      message.success($t('ui.actionMessage.deleteSuccess'));
      await getBindings();
    } catch (error) {
      console.error(error);
    }
  });
}

onMounted(() => {
  getBindings();
});
</script>

<template>
  <a-spin :spinning="loading">
    <div class="-ml-4">
      <div
        v-for="(item, index) in securityOptions"
        :key="index"
        class="flex items-center justify-between px-4 py-3"
      >
        <div class="flex items-center gap-4">
          <SvgGithubIcon
            v-if="item.source === 'Github'"
            class="mt-1.5 size-8"
          />
          <SvgGoogleIcon
            v-if="item.source === 'Google'"
            class="mt-1.5 size-8"
          />
          <div>
            <div>
              {{ item.source }}
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
        <a-button
          v-if="!item.status"
          type="primary"
          @click="OAuth2Binding({ source: item.source })"
        >
          绑定
        </a-button>
        <a-button v-else danger @click="deleteConfirm({ source: item.source })">
          解绑
        </a-button>
      </div>
    </div>
  </a-spin>
</template>
