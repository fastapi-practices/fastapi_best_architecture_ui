import { requestClient } from '#/api/request';

export interface PluginResult {
  [key: string]: any;
}

export async function getPluginListApi() {
  return requestClient.get<PluginResult[]>('/api/v1/sys/plugin');
}

export async function getPluginChangedApi() {
  return requestClient.get<boolean>('/api/v1/sys/plugin/changed');
}

export async function InstallZipPlugin(file: File) {
  return await requestClient.post('/api/v1/sys/plugin/install/zip', { file });
}

export async function InstallGitPlugin(repo_url: string) {
  return await requestClient.post('/api/v1/sys/plugin/install/git', {
    repo_url,
  });
}
