import { requestClient } from '#/api/request';

export interface emailCaptchaParams {
  email: string;
}

/**
 * 获取邮箱验证码
 */
export async function getEmailCaptchaApi(data: emailCaptchaParams) {
  return requestClient.post('/api/v1/email/captcha', data);
}
