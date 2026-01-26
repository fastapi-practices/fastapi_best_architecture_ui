import type { Locale } from 'ant-design-vue/es/locale';

import type { App } from 'vue';

import type { LocaleSetupOptions, SupportedLanguagesType } from '@vben/locales';

import { ref } from 'vue';

import {
  $t,
  setupI18n as coreSetup,
  loadLocalesMapFromDir,
} from '@vben/locales';
import { preferences } from '@vben/preferences';

import antdEnLocale from 'ant-design-vue/es/locale/en_US';
import antdDefaultLocale from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';

const antdLocale = ref<Locale>(antdDefaultLocale);

const modules = import.meta.glob('./langs/**/*.json');

const pluginModules = import.meta.glob('../plugins/**/langs/**/*.json');

const localesMap = loadLocalesMapFromDir(
  /\.\/langs\/([^/]+)\/(.*)\.json$/,
  modules,
);

const pluginLocalesMap = loadLocalesMapFromDir(
  /\/plugins\/[^/]+\/langs\/([^/]+)\/([^/]+)\.json$/,
  pluginModules,
);
/**
 * 加载应用特有的语言包
 * 这里也可以改造为从服务端获取翻译数据
 * @param lang
 */
async function loadMessages(lang: SupportedLanguagesType) {
  const [appLocaleMessages, pluginLocalMessages] = await Promise.all([
    localesMap[lang]?.(),
    pluginLocalesMap[lang]?.(),
    loadThirdPartyMessage(lang),
  ]);
  return { ...appLocaleMessages?.default, ...pluginLocalMessages?.default };
}

/**
 * 加载第三方组件库的语言包
 * @param lang
 */
async function loadThirdPartyMessage(lang: SupportedLanguagesType) {
  await Promise.all([loadAntdLocale(lang), loadDayjsLocale(lang)]);
}

/**
 * 加载dayjs的语言包
 * @param lang
 */
async function loadDayjsLocale(lang: SupportedLanguagesType) {
  let locale;
  switch (lang) {
    case 'en-US': {
      locale = await import('dayjs/locale/en');
      break;
    }
    case 'zh-CN': {
      locale = await import('dayjs/locale/zh-cn');
      break;
    }
    // 默认使用英语
    default: {
      locale = await import('dayjs/locale/en');
    }
  }
  if (locale) {
    dayjs.locale(locale);
  } else {
    console.error(`Failed to load dayjs locale for ${lang}`);
  }
}

/**
 * 加载antd的语言包
 * @param lang
 */
async function loadAntdLocale(lang: SupportedLanguagesType) {
  switch (lang) {
    case 'en-US': {
      antdLocale.value = antdEnLocale;
      break;
    }
    case 'zh-CN': {
      antdLocale.value = antdDefaultLocale;
      break;
    }
  }
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  await coreSetup(app, {
    defaultLocale: preferences.app.locale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  });
}

/**
 * 根据译文反向查找key
 * @param keyword 搜索关键字
 */
async function findKeysByTranslation(keyword: string): Promise<string[]> {
  if (!keyword) return [];

  const keys = new Set<string>();

  // Helper to traverse object and find keys
  const traverse = (obj: any, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        if (value.includes(keyword)) {
          keys.add(currentKey);
        }
      } else if (typeof value === 'object' && value !== null) {
        traverse(value, currentKey);
      }
    }
  };

  // Get all available languages from the maps
  const appLangs = Object.keys(localesMap);
  const pluginLangs = Object.keys(pluginLocalesMap);
  const allLangs = [
    ...new Set([...appLangs, ...pluginLangs]),
  ] as SupportedLanguagesType[];

  // Load all messages
  for (const lang of allLangs) {
    try {
      const [appLocaleMessages, pluginLocalMessages] = await Promise.all([
        localesMap[lang]?.(),
        pluginLocalesMap[lang]?.(),
      ]);

      const messages = {
        ...appLocaleMessages?.default,
        ...pluginLocalMessages?.default,
      };
      traverse(messages);
    } catch (error) {
      console.warn(`Failed to search keys in lang ${lang}`, error);
    }
  }

  return [...keys];
}

export { $t, antdLocale, findKeysByTranslation, setupI18n };
