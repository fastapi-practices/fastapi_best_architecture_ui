import type { Recordable } from '@vben/types';

import type { CaptchaResult, LoginParams, MyUserInfo } from '#/api';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import {
  getAccessCodesApi,
  getCaptchaApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
} from '#/api';
import { $t } from '#/locales';
import { useWebSocketStore } from '#/store';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 登陆验证码
   */
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
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: MyUserInfo | null = null;
    try {
      loginLoading.value = true;
      const { access_token, session_uuid } = await loginApi(
        params as LoginParams,
      );

      // 如果成功获取到 accessToken
      if (access_token) {
        accessStore.setAccessToken(access_token);
        accessStore.setAccessSessionUuid(session_uuid);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        // 初始化WebSocket连接
        const wsStore = useWebSocketStore();
        wsStore.connect();

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

  async function oauth2Login() {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const session_uuid = params.get('session_uuid');

    if (access_token && session_uuid) {
      accessStore.setAccessToken(access_token);
      accessStore.setAccessSessionUuid(session_uuid);
      return true;
    }

    console.error('Missing or invalid access_token or session_uuid');
    return false;
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
    oauth2Login,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
