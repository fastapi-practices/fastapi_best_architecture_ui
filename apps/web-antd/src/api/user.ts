import type { MyUserInfo } from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<MyUserInfo>('/api/v1/sys/users/me');
}
