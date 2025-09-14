import type { DictDataResult } from '#/plugins/dict/api';

import { getDictDataDetailApi } from '#/plugins/dict/api';
import { useDictStore } from '#/store';

export enum DictEnum {
  NOTICE = 'notice',
  SYS_CHOOSE = 'sys_choose',
  SYS_DATA_RULE_EXPRESSION = 'sys_data_rule_expression',
  SYS_DATA_RULE_OPERATOR = 'sys_data_rule_operator',
  SYS_FRONTEND_CONFIG = 'sys_frontend_config',
  SYS_LOGIN_STATUS = 'sys_login_status',
  SYS_MENU_TYPE = 'sys_menu_type',
  SYS_PLUGIN_TYPE = 'sys_plugin_type',
  SYS_STATUS = 'sys_status',
  TASK_PERIOD_TYPE = 'task_period_type',
  TASK_STRATEGY_TYPE = 'task_strategy_type',
  USER_ONLINE_STATUS = 'user_online_status',
}

export interface DictOptionsParams {
  /**
   * 是否将字典值格式化为数字类型
   */
  asNumber?: boolean;
  /**
   * 是否将字典值格式化为布尔类型
   */
  asBoolean?: boolean;
}

export function getDictOptions(
  dictName: string,
  params: DictOptionsParams = {},
) {
  const { dictRequestCache, setDictInfo, getDictOptions } = useDictStore();
  const dataList = getDictOptions(dictName);

  const { asNumber = false, asBoolean = false } = params;

  // 检查请求状态缓存
  if (dataList.length === 0 && !dictRequestCache.has(dictName)) {
    const requestPromise = getDictDataDetailApi(dictName)
      .then((res: DictDataResult[]) => {
        setDictInfo(dictName, res);
        return res;
      })
      .catch((error: any) => {
        console.error(error);
        return [] as DictDataResult[];
      })
      .finally(() => {
        if (dataList.length > 0) {
          dictRequestCache.delete(dictName);
        }
      });

    dictRequestCache.set(dictName, requestPromise);
  }

  if (asNumber && dataList.length > 0) {
    return dataList.map((item) => ({
      ...item,
      value: Number(item.value),
    }));
  }

  if (asBoolean && dataList.length > 0) {
    return dataList.map((item) => ({
      ...item,
      value: item.value === 'true',
    }));
  }

  return dataList;
}
