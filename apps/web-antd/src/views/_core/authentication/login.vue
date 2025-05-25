<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, h, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Image, notification } from 'ant-design-vue';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const showNotification = () => {
  notification.warning({
    message: h('span', { class: 'font-semibold' }, '公告'),
    description: h('div', [
      h('p', { class: 'mb-2' }, [
        '您正在浏览 ',
        h(
          'span',
          { class: 'font-bold' },
          '基于 Vben Admin Antd 构建的 fastapi_best_architecture 前端完整版实施',
        ),
      ]),
      h('ul', { class: 'list-disc pl-5 space-y-1' }, [
        h('li', null, [
          '此项目目前仍处于 WIP (Work In Progress) 状态',
          ' ',
          h(
            'span',
            {
              class:
                'inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full',
            },
            '开发阶段',
          ),
        ]),
        h('li', null, [
          '计划于第二季度结束前完成',
          h('span', { class: 'text-gray-500 ml-1' }, '（可能延期）'),
        ]),
      ]),
    ]),
    duration: null,
    placement: 'bottom',
    class: 'w-full',
  });
};

onMounted(() => {
  showNotification();
});

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
  } catch (error) {
    console.error(error);
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
