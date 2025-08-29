import { requestClient } from '#/api/request';

export async function getOAuth2Github() {
  return requestClient.get<string>('/api/v1/oauth2/github');
}

export async function getOAuth2Google() {
  return requestClient.get<string>('/api/v1/oauth2/google');
}

export async function getOAuth2LinuxDo() {
  return requestClient.get<string>('/api/v1/oauth2/linux-do');
}
