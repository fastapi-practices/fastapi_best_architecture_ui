import { defineStore } from 'pinia';
import { getUserInfo } from '@/api/user';
import { clearToken, setToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { UserState } from '@/store/modules/user/types';
import {
  CaptchaRes,
  getCaptcha,
  login as userLogin,
  LoginData,
  logout as userLogout,
} from '@/api/auth';
import useAppStore from '../app';

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    username: undefined,
    nickname: undefined,
    avatar: undefined,
    is_superuser: false,
    roles: '',
  }),

  getters: {
    userInfo(state: UserState): UserState {
      return { ...state };
    },
  },

  actions: {
    // switchRoles() {
    // return new Promise((resolve) => {
    // this.role = this.role === 'user' ? 'admin' : 'user';
    // resolve(this.role);
    // });
    // },
    // Set user's information
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
    },

    // Reset user's information
    resetInfo() {
      this.$reset();
    },

    // Get user's information
    async info() {
      const res = await getUserInfo();
      this.setInfo(res);
    },

    // Get captcha
    async captcha() {
      const res: CaptchaRes = await getCaptcha();
      return res.image;
    },

    // Login
    async login(loginForm: LoginData) {
      try {
        const res = await userLogin(loginForm);
        setToken(res.access_token);
      } catch (err) {
        clearToken();
        throw err;
      }
    },
    logoutCallBack() {
      const appStore = useAppStore();
      this.resetInfo();
      clearToken();
      removeRouteListener();
      appStore.clearServerMenu();
    },

    // Logout
    async logout() {
      try {
        await userLogout();
      } finally {
        this.logoutCallBack();
      }
    },
  },
});

export default useUserStore;
