<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, h, onMounted, onUnmounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

import { Image } from 'antdv-next';

import OAuth2Login from '#/plugins/oauth2/views/login.vue';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const accessStore = useAccessStore();

const MOCK_USER_OPTIONS: BasicOption[] = [
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'Test',
    value: 'test',
  },
];

const imageSrc = ref('');
const captchaEnabled = ref(false);
const captchaExpireSeconds = ref(0);
let refreshTimer: null | ReturnType<typeof setTimeout> = null;

const refreshCaptcha = async () => {
  try {
    const captcha = await authStore.captcha();
    captchaEnabled.value = captcha.is_enabled;
    captchaExpireSeconds.value = captcha.expire_seconds;
    imageSrc.value = `data:image/png;base64, ${captcha.image}`;

    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    // 自动刷新（提前3秒刷新）
    if (captcha.is_enabled && captcha.expire_seconds > 0) {
      const refreshDelay = Math.max((captcha.expire_seconds - 3) * 1000, 1000);
      refreshTimer = setTimeout(() => {
        refreshCaptcha();
      }, refreshDelay);
    }
  } catch (error) {
    console.error(error);
  }
};

const formSchema = computed((): VbenFormSchema[] => {
  const baseFields: VbenFormSchema[] = [
    {
      component: 'VbenSelect',
      componentProps: {
        options: MOCK_USER_OPTIONS,
        placeholder: $t('authentication.selectAccount'),
      },
      fieldName: 'selectAccount',
      label: $t('authentication.selectAccount'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.selectAccount') })
        .optional()
        .default('admin'),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      dependencies: {
        trigger(values, form) {
          if (values.selectAccount) {
            const findUser = MOCK_USER_OPTIONS.find(
              (item) => item.value === values.selectAccount,
            );
            if (findUser) {
              form.setValues({
                password: '123456',
                username: findUser.value,
              });
            }
          }
        },
        triggerFields: ['selectAccount'],
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  ];

  if (captchaEnabled.value) {
    baseFields.push(
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: $t('page.auth.captchaPlaceholder'),
        },
        fieldName: 'captcha',
        label: $t('authentication.password'),
        rules: z
          .string()
          .min(1, { message: $t('page.auth.captchaRequired') })
          .optional()
          .default(''),
        formItemClass: 'w-2/3',
      },
      {
        component: 'VbenInput',
        fieldName: 'uuid',
        formItemClass: 'hidden',
        dependencies: {
          trigger: (_, form) => {
            form.setValues({
              uuid: accessStore.captchaUuid,
            });
          },
          triggerFields: ['captchaImg'],
        },
      },
      {
        component: h(Image),
        componentProps: {
          src: imageSrc.value,
          width: 120,
          height: 40,
          preview: false,
          onClick: refreshCaptcha,
        },
        fieldName: 'captchaImg',
        formItemClass: 'ml-auto -mt-[74px]',
      },
    );
  }

  return baseFields;
});

onMounted(() => {
  refreshCaptcha();
});

onUnmounted(() => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="authStore.authLogin"
  >
    <template #third-party-login>
      <OAuth2Login />
    </template>
  </AuthenticationLogin>
</template>
