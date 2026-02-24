<script setup lang="ts">
import { SvgGithubIcon, SvgGoogleIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { getOAuth2Github, getOAuth2Google } from '#/plugins/oauth2/api';

defineOptions({ name: 'OAuth2Login' });

interface OAuth2Source {
  source: 'Github' | 'Google';
}

const OAuth2 = async (oa: OAuth2Source) => {
  try {
    switch (oa.source) {
      case 'Github': {
        window.location.href = await getOAuth2Github();
        break;
      }
      case 'Google': {
        window.location.href = await getOAuth2Google();
        break;
      }
      // No default
    }
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div class="w-full sm:mx-auto md:max-w-md">
    <div class="mt-4 flex items-center justify-between">
      <span class="w-[35%] border-b border-input dark:border-gray-600"></span>
      <span class="text-center text-xs uppercase text-muted-foreground">
        {{ $t('authentication.thirdPartyLogin') }}
      </span>
      <span class="w-[35%] border-b border-input dark:border-gray-600"></span>
    </div>

    <a-flex class="mt-4" justify="center" gap="large">
      <a-tooltip :title="$t('authentication.githubLogin')" placement="top">
        <SvgGithubIcon
          class="size-6 cursor-pointer"
          @click="OAuth2({ source: 'Github' })"
        />
      </a-tooltip>
      <a-tooltip :title="$t('authentication.googleLogin')" placement="top">
        <SvgGoogleIcon
          class="size-6 cursor-pointer"
          @click="OAuth2({ source: 'Google' })"
        />
      </a-tooltip>
    </a-flex>
  </div>
</template>
