import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';

/**
 * 可自行安装依赖并按格式配置 函数形参为配置项
 * @see https://github.com/logue/vue-codemirror6?tab=readme-ov-file#supported-languages Language Support项
 */
export const languageSupportMap = {
  sql: sql(),
  python: python(),
};

export type LanguageSupport = keyof typeof languageSupportMap;
