import { requestClient } from '#/api/request';

export interface emailCaptchaParams {
  recipients: string;
}

/**
 * 获取邮箱验证码
 */
export async function getEmailCaptchaApi(data: emailCaptchaParams) {
  return requestClient.post('/api/v1/emails/captcha', data);
}
