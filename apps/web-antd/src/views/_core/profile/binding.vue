<script setup lang="ts">
import type { OAuth2BindingParams } from '#/plugins/oauth2/api';

import { computed, onMounted, ref } from 'vue';

import { confirm } from '@vben/common-ui';
import { MdiGithub, MdiGoogle } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import {
  deleteOAuth2Binding,
  getOAuth2BindingAuthUrl,
  getOAuth2Bindings,
} from '#/plugins/oauth2/api';

const bindings = ref<string[]>([]);
const loading = ref<boolean>(false);

const securityOptions = computed(() => [
  {
    source: 'Github',
    description: '绑定 Github 账号',
    status: bindings.value?.includes('Github'),
    statusString: bindings.value?.includes('Github') ? '已绑定' : '未绑定',
  },
  {
    source: 'Google',
    description: '绑定 Google 账号',
    status: bindings.value?.includes('Google'),
    statusString: bindings.value?.includes('Google') ? '已绑定' : '未绑定',
  },
  {
    source: 'LinuxDo',
    description: '绑定 LinuxDo 账号',
    status: bindings.value?.includes('LinuxDo'),
    statusString: bindings.value?.includes('LinuxDo') ? '已绑定' : '未绑定',
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
      case 'LinuxDo': {
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
    <a-list :data-source="securityOptions" :split="false" class="-ml-4">
      <template #renderItem="{ item }">
        <a-list-item>
          <template #actions>
            <a-button
              v-if="!item.status"
              type="primary"
              @click="OAuth2Binding({ source: item.source })"
            >
              绑定
            </a-button>
            <a-button
              v-else
              danger
              @click="deleteConfirm({ source: item.source })"
            >
              解绑
            </a-button>
          </template>
          <a-list-item-meta :description="item.description">
            <template #avatar>
              <MdiGithub
                v-if="item.source === 'Github'"
                class="mt-1.5 size-8"
              />
              <MdiGoogle
                v-if="item.source === 'Google'"
                class="mt-1.5 size-8"
              />
              <img
                v-if="item.source === 'LinuxDo'"
                src="https://linux.do/logo-32.svg"
                class="mt-1.5"
              />
            </template>
            <template #title>
              {{ item.source }}
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
  </a-spin>
</template>
