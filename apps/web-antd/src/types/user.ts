import type { MyBasicUserInfo } from '#/store';

/**
 * 重写用户信息
 */
interface MyUserInfo extends MyBasicUserInfo {
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 首页地址
   */
  homePath: string;

  /**
   * accessToken
   */
  token: string;
}

export type { MyUserInfo };
