import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

export interface MyUserInfo extends UserInfo {
  id: number;
  nickname: string;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<MyUserInfo>('/api/v1/sys/users/me');
}
