import { defineStore } from 'pinia';
import { Notification } from '@arco-design/web-vue';
import type { NotificationReturn } from '@arco-design/web-vue/es/notification/interface';
import defaultSettings from '@/config/settings.json';
import { getUserMenuList } from '@/api/user';
import convertToCamelCase, { convertToKebabCase } from '@/utils/string';
import { WHITE_LIST } from '@/router/constants';
import { AppRouteRecordRaw } from '@/router/routes/types';
import { RouteRecordNormalized } from 'vue-router';
import { AppState, MenuItem } from './types';

function generateMenu(
  data: MenuItem[],
  parentName?: string
): AppRouteRecordRaw[] {
  const menuData: AppRouteRecordRaw[] = [];
  const views = import.meta.glob('@/views/**/*.vue');

  data.forEach((menu) => {
    const localeName = convertToCamelCase(menu.name);
    const menuItem: AppRouteRecordRaw = {
      path: !menu.path ? `/${convertToKebabCase(menu.name)}` : menu.path,
      name: menu.name,
      component: !menu.component
        ? () => import('@/views/not-found/index.vue')
        : views[`/src/views${menu.component}`],
      children: [],
      fullPath: menu.path,
      meta: {
        title: menu.title,
        // roles: menu.perms ? menu.perms.split(',') : [],
        roles: ['*'],
        requiresAuth: WHITE_LIST.some((item) => item.name === menu.name),
        icon: menu.icon,
        hideInMenu: menu.show === 0,
        ignoreCache: menu.cache === 0,
        order: menu.sort,
        locale: parentName
          ? `menu.${parentName}.${localeName}`
          : `menu.${localeName}`,
      },
    };

    if (menu.children && menu.children.length > 0) {
      menuItem.children = generateMenu(menu.children, localeName);
    }

    menuData.push(menuItem);
  });

  return menuData;
}

const useAppStore = defineStore('app', {
  state: (): AppState => ({ ...defaultSettings }),

  getters: {
    appCurrentSetting(state: AppState): AppState {
      return { ...state };
    },
    appDevice(state: AppState) {
      return state.device;
    },
    appAsyncMenus(state: AppState): RouteRecordNormalized[] {
      return state.serverMenu as unknown as RouteRecordNormalized[];
    },
  },

  actions: {
    // Update app settings
    updateSettings(partial: Partial<AppState>) {
      // @ts-ignore-next-line
      this.$patch(partial);
    },

    // Change theme color
    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark';
        document.body.setAttribute('arco-theme', 'dark');
      } else {
        this.theme = 'light';
        document.body.removeAttribute('arco-theme');
      }
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value;
    },
    async fetchServerMenuConfig() {
      let notifyInstance: NotificationReturn | null = null;
      try {
        notifyInstance = Notification.info({
          id: 'menuNotice', // Keep the instance id the same
          content: 'loading',
          closable: true,
        });
        const data = await getUserMenuList();
        this.serverMenu = generateMenu(
          data
        ) as unknown as RouteRecordNormalized[];
        notifyInstance = Notification.success({
          id: 'menuNotice',
          content: 'success',
          closable: true,
        });
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        notifyInstance = Notification.error({
          id: 'menuNotice',
          content: 'error',
          closable: true,
        });
      }
    },
    clearServerMenu() {
      this.serverMenu = [];
    },
  },
});

export default useAppStore;
