import type { DictDataResult } from '#/plugins/dict/api';

import { $t } from '@vben/locales';

import { defineStore } from 'pinia';

export interface DictOption {
  disabled?: boolean;
  label: string;
  value: string;
  color?: string;
}

export function dictToOptions(data: DictDataResult[]): DictOption[] {
  return data.map((item) => ({
    disabled: item.status === 0,
    label: $t(item.label),
    value: item.value,
    color: item.color,
  }));
}

export const useDictStore = defineStore('dict', () => {
  const dictOptionsMap = new Map<string, DictOption[]>();
  const dictRequestCache = new Map<string, Promise<DictDataResult[]>>();

  function getDictOptions(dictName: string): DictOption[] {
    if (!dictName) return [];

    if (!dictOptionsMap.has(dictName)) {
      dictOptionsMap.set(dictName, []);
    }

    return dictOptionsMap.get(dictName) || [];
  }

  function setDictInfo(dictName: string, dictValue: DictDataResult[]) {
    if (
      dictOptionsMap.has(dictName) &&
      dictOptionsMap.get(dictName)?.length === 0
    ) {
      const options = dictOptionsMap.get(dictName);
      if (options) {
        options.push(...dictToOptions(dictValue));
      }
    } else {
      dictOptionsMap.set(dictName, dictToOptions(dictValue));
    }
  }

  function resetCache() {
    dictOptionsMap.clear();
    dictRequestCache.clear();
  }

  function $reset() {
    /**
     * doNothing
     */
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
