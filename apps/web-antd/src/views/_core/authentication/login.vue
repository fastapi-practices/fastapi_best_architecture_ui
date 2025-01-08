<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, h, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Image } from 'ant-design-vue';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

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
const refreshCaptcha = async () => {
  try {
    const captcha = await authStore.captcha();
    imageSrc.value = `data:image/png;base64, ${captcha}`;
  } catch {
    // 不做处理
  }
};
refreshCaptcha();

const formSchema = computed((): VbenFormSchema[] => {
  return [
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
                username: findUser.value,
                password: '123456',
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
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('page.auth.captchaPlaceholder'),
      },
      fieldName: 'captcha',
      label: $t('authentication.password'),
      rules: z.string().length(4, { message: $t('page.auth.captchaRequired') }),
      formItemClass: 'w-2/3',
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
      formItemClass: 'ml-auto -mt-16',
    },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-code-login="false"
    :show-qrcode-login="false"
    @submit="authStore.authLogin"
  />
</template>
