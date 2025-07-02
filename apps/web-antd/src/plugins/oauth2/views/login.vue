<script setup lang="ts">
import { $t } from '@vben/locales';

import { getOAuth2LinuxDo } from '#/plugins/oauth2/api';

defineOptions({ name: 'OAuth2Login' });

const linuxDoOAuth2 = async () => {
  try {
    window.location.href = await getOAuth2LinuxDo();
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div class="w-full sm:mx-auto md:max-w-md">
    <div class="mt-4 flex items-center justify-between">
      <span class="border-input w-[35%] border-b dark:border-gray-600"></span>
      <span class="text-muted-foreground text-center text-xs uppercase">
        {{ $t('authentication.thirdPartyLogin') }}
      </span>
      <span class="border-input w-[35%] border-b dark:border-gray-600"></span>
    </div>

    <div class="mt-4 flex flex-wrap justify-center gap-2">
      <a-button class="mb-3" shape="circle" type="ghost" @click="linuxDoOAuth2">
        <img src="https://linux.do/logo-25.svg" />
      </a-button>
    </div>
  </div>
</template>
