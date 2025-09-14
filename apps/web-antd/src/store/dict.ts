import type { DictDataResult } from '#/plugins/dict/api';
import type { DictOptionsParams } from '#/utils/dict';

import { reactive } from 'vue';

import { $t } from '@vben/locales';

import { defineStore } from 'pinia';

import { DICT_CONFIG } from '#/utils/dict';

export interface DictOption {
  disabled?: boolean;
  label: string;
  value: boolean | number | string;
  color?: string;
}

export function dictToOptions(
  data: DictDataResult[],
  params: DictOptionsParams = {},
): DictOption[] {
  const { asNumber = false, asBoolean = false } = params;
  return data.map((item) => {
    let value: boolean | number | string = item.value;
    if (asNumber) {
      value = Number(item.value);
    } else if (asBoolean) {
      value = item.value === 'true';
    }
    return {
      disabled: item.status === 0,
      label: $t(item.label),
      value,
      color: item.color,
    };
  });
}

export const useDictStore = defineStore('dict', () => {
  const dictOptionsMap = reactive(new Map<string, DictOption[]>());
  const dictRequestCache = reactive(
    new Map<string, Promise<DictDataResult[]>>(),
  );

  function generateCacheKey(
    dictName: string,
    params: DictOptionsParams = {},
  ): string {
    const { asNumber = false, asBoolean = false } = {
      ...DICT_CONFIG[dictName],
      ...params,
    };
    return `${dictName}_${asNumber}_${asBoolean}`;
  }

  function getDictOptions(
    dictName: string,
    params: DictOptionsParams = {},
  ): DictOption[] {
    if (!dictName) return [];

    // 合并默认配置和传入的 params，传入的 params 优先级更高
    const mergedParams = { ...DICT_CONFIG[dictName], ...params };
    const cacheKey = generateCacheKey(dictName, mergedParams);

    if (!dictOptionsMap.has(cacheKey)) {
      dictOptionsMap.set(cacheKey, []);
    }

    return dictOptionsMap.get(cacheKey) || [];
  }

  function setDictInfo(
    dictName: string,
    dictValue: DictDataResult[],
    params: DictOptionsParams = {},
  ) {
    const mergedParams = { ...DICT_CONFIG[dictName], ...params };
    const cacheKey = generateCacheKey(dictName, mergedParams);

    if (
      dictOptionsMap.has(cacheKey) &&
      dictOptionsMap.get(cacheKey)?.length === 0
    ) {
      dictOptionsMap
        .get(cacheKey)
        ?.push(...dictToOptions(dictValue, mergedParams));
    } else {
      dictOptionsMap.set(cacheKey, dictToOptions(dictValue, mergedParams));
    }
  }

  function resetCache() {
    dictOptionsMap.clear();
    dictRequestCache.clear();
  }

  function $reset() {
    // doNothing
  }

  return {
    $reset,
    dictOptionsMap,
    dictRequestCache,
    getDictOptions,
    setDictInfo,
    resetCache,
  };
});
