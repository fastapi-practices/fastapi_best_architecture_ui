import { requestClient } from '#/api/request';

export interface PluginResult {
  [key: string]: any;
}

export async function getPluginListApi() {
  return requestClient.get<PluginResult[]>('/api/v1/sys/plugins');
}

export async function getPluginChangedApi() {
  return requestClient.get<boolean>('/api/v1/sys/plugins/changed');
}

export async function installZipPluginApi(file: File) {
  return await requestClient.upload(
    '/api/v1/sys/plugins',
    { file },
    { params: { type: 'zip' }, timeout: 60_000 },
  );
}

export async function installGitPluginApi(repo_url: string) {
  return await requestClient.post('/api/v1/sys/plugins', undefined, {
    params: { type: 'git', repo_url },
  });
}

export async function updatePluginStatus(plugin: string) {
  return await requestClient.put(`/api/v1/sys/plugins/${plugin}/status`);
}

export async function downloadPluginApi(plugin: string) {
  return await requestClient.download<Blob>(`/api/v1/sys/plugins/${plugin}`);
}

export async function uninstallPluginApi(plugin: string) {
  return await requestClient.delete(`/api/v1/sys/plugins/${plugin}`);
}
