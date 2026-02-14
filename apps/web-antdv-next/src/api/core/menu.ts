import type { RouteRecordStringComponent } from '@vben/types';

import { $t } from '@vben/locales';

import { requestClient } from '#/api/request';

export interface SysMenuResult {
  id: number;
  title: string;
  name: string;
  path: string;
  sort: number;
  icon?: string;
  type: number;
  component?: string;
  perms?: string;
  status: number;
  display: number;
  cache: number;
  remark?: string;
  parent_id?: number;
  created_time: string;
}

export interface SysMenuTreeResult extends SysMenuResult {
  children?: SysMenuTreeResult[];
}

export interface SysMenuParams {
  title: string;
  name: string;
  path?: string;
  parent_id?: number;
  sort?: number;
  icon?: string;
  type?: number;
  component?: string;
  perms?: string;
  status?: number;
  display?: number;
  cache?: number;
  link?: string;
  remark?: string;
}

export interface SysMenuTreeParams {
  title?: string;
  status: number;
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>(
    '/api/v1/sys/menus/sidebar',
  );
}

export async function getSysMenuTreeApi(params: SysMenuTreeParams) {
  const transformMenuTitles = (menuData: SysMenuTreeResult[]) => {
    return menuData.map((item) => {
      const transformedItem = {
        ...item,
        title: $t(item.title),
      };

      if (item.children && item.children.length > 0) {
        transformedItem.children = transformMenuTitles(item.children);
      }

      return transformedItem;
    });
  };

  const filterMenuTree = (
    menuData: SysMenuTreeResult[],
    keyword: string,
  ): SysMenuTreeResult[] => {
    const lowerKeyword = keyword.toLowerCase();
    const result: SysMenuTreeResult[] = [];
    for (const item of menuData) {
      const filteredChildren = item.children?.length
        ? filterMenuTree(item.children, keyword)
        : [];
      const isMatch = item.title.toLowerCase().includes(lowerKeyword);
      if (isMatch || filteredChildren.length > 0) {
        result.push({
          ...item,
          children: isMatch ? item.children : filteredChildren,
        });
      }
    }
    return result;
  };

  const { title, ...restParams } = params;

  const data = await requestClient.get<SysMenuTreeResult[]>(
    '/api/v1/sys/menus',
    {
      params: restParams,
    },
  );

  const translatedData = transformMenuTitles(data);

  if (title) {
    return filterMenuTree(translatedData, title);
  }

  return translatedData;
}

export async function createSysMenuApi(data: SysMenuParams) {
  return requestClient.post('/api/v1/sys/menus', data);
}

export async function updateSysMenuApi(pk: number, data: SysMenuParams) {
  return requestClient.put(`/api/v1/sys/menus/${pk}`, data);
}

export async function deleteSysMenuApi(pk: number) {
  return requestClient.delete(`/api/v1/sys/menus/${pk}`);
}
