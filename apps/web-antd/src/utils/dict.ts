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

export const DICT_CONFIG: Record<string, DictOptionsParams> = {
  [DictEnum.SYS_STATUS]: { asNumber: true },
  [DictEnum.NOTICE]: { asNumber: true },
  [DictEnum.SYS_CHOOSE]: { asBoolean: true },
  [DictEnum.SYS_DATA_RULE_EXPRESSION]: { asNumber: true },
  [DictEnum.SYS_DATA_RULE_OPERATOR]: { asNumber: true },
  [DictEnum.SYS_FRONTEND_CONFIG]: { asBoolean: true },
  [DictEnum.SYS_LOGIN_STATUS]: { asNumber: true },
  [DictEnum.SYS_MENU_TYPE]: { asNumber: true },
  [DictEnum.SYS_PLUGIN_TYPE]: { asNumber: true },
  [DictEnum.TASK_PERIOD_TYPE]: { asString: true },
  [DictEnum.TASK_STRATEGY_TYPE]: { asNumber: true },
  [DictEnum.USER_ONLINE_STATUS]: { asNumber: true },
};

export interface DictOptionsParams {
  asNumber?: boolean;
  asBoolean?: boolean;
  asString?: boolean; // 可选，显式支持 string 类型
}

export function getDictOptions(
  dictName: string,
  params: DictOptionsParams = {},
) {
  const { dictRequestCache, setDictInfo, getDictOptions } = useDictStore();
  const mergedParams = { ...DICT_CONFIG[dictName], ...params };
  const cacheKey = `${dictName}_${mergedParams.asNumber}_${mergedParams.asBoolean}`;
  const dataList = getDictOptions(dictName, mergedParams);

  if (dataList.length === 0 && !dictRequestCache.has(cacheKey)) {
    const requestPromise = getDictDataDetailApi(dictName)
      .then((res: DictDataResult[]) => {
        setDictInfo(dictName, res, mergedParams);
        return res;
      })
      .catch((error: any) => {
        console.error(error);
        return [] as DictDataResult[];
      })
      .finally(() => {
        if (dataList.length > 0) {
          dictRequestCache.delete(cacheKey);
        }
      });

    dictRequestCache.set(cacheKey, requestPromise);
  }

  return dataList;
}

// 预加载所有字典
export function preloadDictOptions() {
  Object.keys(DICT_CONFIG).forEach((dictName) => {
    getDictOptions(dictName, DICT_CONFIG[dictName]);
  });
}
