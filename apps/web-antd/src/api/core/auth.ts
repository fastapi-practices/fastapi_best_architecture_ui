import { miniRequestClient, requestClient } from '#/api/request';

export interface CaptchaResult {
  image: string;
  image_type: string;
}

export interface LoginParams {
  username: string;
  password: string;
  captcha: string;
}

export interface LoginResult {
  access_token: string;
  session_uuid: string;
}

export type RefreshTokenResult = LoginResult;

/**
 * 登录验证码
 */
export async function getCaptchaApi() {
  return requestClient.get<CaptchaResult>('/api/v1/auth/captcha');
}

/**
 * 登录
 */
export async function loginApi(data: LoginParams) {
  return requestClient.post<LoginResult>('/api/v1/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return miniRequestClient.post<RefreshTokenResult>(
    '/api/v1/auth/tokens',
    undefined,
    {
      withCredentials: true,
    },
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post('/api/v1/auth/logout');
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/api/v1/auth/codes');
}
