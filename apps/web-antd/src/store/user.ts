import { acceptHMRUpdate, defineStore } from 'pinia';

interface MyBasicUserInfo {
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户id
   */
  id: string;
  /**
   * 用户昵称
   */
  nickname: string;
  /**
   * 用户角色
   */
  roles?: string[];
  /**
   * 用户名
   */
  username: string;
}

interface AccessState {
  /**
   * 用户信息
   */
  userInfo: MyBasicUserInfo | null;
  /**
   * 用户角色
   */
  userRoles: string[];
}

/**
 * @zh_CN 重写用户信息相关
 */
export const myUseUserStore = defineStore('core-user', {
  actions: {
    setUserInfo(userInfo: MyBasicUserInfo | null) {
      // 设置用户信息
      this.userInfo = userInfo;
      // 设置角色信息
      const roles = userInfo?.roles ?? [];
      this.setUserRoles(roles);
    },
    setUserRoles(roles: string[]) {
      this.userRoles = roles;
    },
  },
  state: (): AccessState => ({
    userInfo: null,
    userRoles: [],
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(myUseUserStore, hot));
}

export type { MyBasicUserInfo };
