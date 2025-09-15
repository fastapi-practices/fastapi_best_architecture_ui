import type { DictDataResult } from '#/plugins/dict/api';
import type { DictOptionsParams } from '#/utils/dict';

import { reactive } from 'vue';

import { $t } from '@vben/locales';

import { defineStore } from 'pinia';

export interface DictOption {
  disabled?: boolean;
  label: string;
  value: boolean | number | string;
  color?: string;
}

export function dictToOptions(
  data: DictDataResult[],
  params: DictOptionsParams,
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
    params: DictOptionsParams,
  ): string {
    const { asNumber = false, asBoolean = false } = params;
    return `${dictName}_${asNumber}_${asBoolean}`;
  }

  function getDictOptions(
    dictName: string,
    params: DictOptionsParams,
  ): DictOption[] {
    if (!dictName) return [];

    const cacheKey = generateCacheKey(dictName, params);

    if (!dictOptionsMap.has(cacheKey)) {
      dictOptionsMap.set(cacheKey, []);
    }

    return dictOptionsMap.get(cacheKey) || [];
  }

  function setDictInfo(
    dictName: string,
    dictValue: DictDataResult[],
    params: DictOptionsParams,
  ) {
    const cacheKey = generateCacheKey(dictName, params);

    if (
      dictOptionsMap.has(cacheKey) &&
      dictOptionsMap.get(cacheKey)?.length === 0
    ) {
      dictOptionsMap.get(cacheKey)?.push(...dictToOptions(dictValue, params));
    } else {
      dictOptionsMap.set(cacheKey, dictToOptions(dictValue, params));
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
