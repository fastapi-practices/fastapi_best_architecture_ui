import { requestClient } from '#/api/request';

export interface OAuth2CallBackParams {
  code: string;
  state?: string;
  code_verifier?: string;
}

export async function getOAuth2LinuxDo() {
  return requestClient.get<string>('/api/v1/oauth2/linux-do');
}

export async function getOAuth2LinuxDoCallback(params: OAuth2CallBackParams) {
  return requestClient.get('/api/v1/oauth2/linux-do/callback', { params });
}
