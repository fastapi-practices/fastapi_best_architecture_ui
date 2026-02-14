import { requestClient } from '#/api/request';

interface phoneCaptchaParams {
  phone: string;
}

/**
 * 发送短信验证码
 */
export async function getPhoneCaptchaApi(data: phoneCaptchaParams) {
  return requestClient.post('/api/v1/phones/captcha', data);
}
