import type { CaptchaResult } from '#/api';
import type { MyUserInfo } from '#/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getCaptchaApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

import { myUseUserStore } from '.';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = myUseUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /** 登陆验证码 */
  async function captcha() {
    const res: CaptchaResult = await getCaptchaApi();
    return res.image;
  }

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: any,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: MyUserInfo | null = null;
    try {
      loginLoading.value = true;
      const { access_token } = await loginApi(params);

      // 如果成功获取到 accessToken
      if (access_token) {
        accessStore.setAccessToken(access_token);

        // 获取用户信息并存储到 accessStore 中
        userInfo = userInfo = await Promise.resolve(fetchUserInfo());

        userStore.setUserInfo(userInfo);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(userInfo.homePath || DEFAULT_HOME_PATH);
        }

        if (userInfo?.nickname) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.nickname}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: MyUserInfo | null = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    captcha,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
