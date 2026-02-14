import { requestClient } from '#/api/request';

export interface OAuth2BindingResult {
  id: number;
  sid: string;
  source: string;
  user_id: number;
}

export interface OAuth2BindingParams {
  source: 'Github' | 'Google';
}

export async function getOAuth2Github() {
  return requestClient.get<string>('/api/v1/oauth2/github');
}

export async function getOAuth2Google() {
  return requestClient.get<string>('/api/v1/oauth2/google');
}

export async function getOAuth2Bindings() {
  return requestClient.get<string[]>('/api/v1/oauth2/me/bindings');
}

export async function getOAuth2BindingAuthUrl(params: OAuth2BindingParams) {
  return requestClient.get<string>('/api/v1/oauth2/me/binding', { params });
}

export async function deleteOAuth2Binding(params: OAuth2BindingParams) {
  return requestClient.delete('/api/v1/oauth2/me/unbinding', { params });
}
