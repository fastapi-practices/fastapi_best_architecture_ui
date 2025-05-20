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

export async function installZipPluginApi(file: File) {
  return await requestClient.upload(
    '/api/v1/sys/plugin/install/zip',
    { file },
    { timeout: 60_000 },
  );
}

export async function installGitPluginApi(repo_url: string) {
  return await requestClient.post('/api/v1/sys/plugin/install/git', undefined, {
    params: { repo_url },
  });
}

export async function uninstallPluginApi(plugin: string) {
  return await requestClient.delete('/api/v1/sys/plugin/uninstall', {
    params: { plugin },
  });
}

export async function updatePluginStatus(plugin: string) {
  return await requestClient.post('/api/v1/sys/plugin/status', undefined, {
    params: { plugin },
  });
}

export async function buildPluginApi(plugin: string) {
  return await requestClient.download<Blob>(`/api/v1/sys/plugin/zip/${plugin}`);
}
