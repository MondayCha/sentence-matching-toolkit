import { atom, selector } from 'recoil';
import { Store } from 'tauri-plugin-store-api';
import { platform } from '@tauri-apps/api/os';

import {
  getDictSize,
  getSubCategoryInfo,
  startCategoryMatching,
  loadMatchingRule,
  startSubCategoryMatching,
  AppStatus,
} from '@/api/core';
import log from '@/middleware/logger';
import { getBaseFilenameFromPath, getTimestamp } from './utils';

// Tauri FileSystem Store
export const store = new Store('.settings.dat');

// Navigation Bar State Enum
export const enum NavIndex {
  Upload = 0,
  Category,
  SubCategory,
  Download,
  About,
  Setting,
}

// Platform State
export const platformState = atom({
  key: 'platformState',
  default: selector({
    key: 'platformState/Default',
    get: async () => {
      try {
        const res = await platform();
        return res;
      } catch (err) {
        log.error('platformState err', err);
        return 'win32';
      }
    },
  }),
});

// Navigation Bar State
export const navIndexState = atom({
  key: 'navIndexState',
  default: NavIndex.Upload,
});

export const appStatusState = atom({
  key: 'appStatusState',
  default: AppStatus.Idle,
});

// Matching Rule Name
export const matchingRuleState = atom({
  key: 'matchingRuleState',
  default: selector({
    key: 'matchingRuleState/Default',
    get: async () => {
      try {
        const res = await loadMatchingRule(null);
        log.info('matchingRuleState', res);
        return {
          name: res as string,
        };
      } catch (err) {
        log.error('matchingRuleState err', err);
        return {
          name: '',
        };
      }
    },
  }),
});

// Dictionary State Key
export const DICT_SETTING_KEY = 'auto_import_dict';

// Dictionary State Selector
export const dictState = atom({
  key: 'dictionaryState',
  default: selector({
    key: 'dictionaryState/default',
    get: async () => {
      const val = await store.get(DICT_SETTING_KEY);
      return val === true;
    },
  }),
});

// Theme State Key
export const THEME_SETTING_KEY = 'theme';
export type ThemeMode = 'light' | 'dark';
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// Theme State Selector
export const themeState = atom({
  key: 'themeState',
  default: selector({
    key: 'themeState/default',
    get: async () => {
      // await new Promise((res) => setTimeout(res, 1000 * 5));
      const val = await store.get(THEME_SETTING_KEY);
      if (val !== 'light' && val !== 'dark') {
        const darkMode = window.matchMedia(DARK_SCHEME_QUERY).matches;
        return darkMode ? 'dark' : 'light';
      }
      return val as ThemeMode;
    },
  }),
});

// Dictionary State Selector
export const dictSizeState = atom({
  key: 'dictionarySizeState',
  default: selector({
    key: 'dictionarySizeState/default',
    get: async ({ get }) => {
      const rule = get(matchingRuleState);
      const val = await getDictSize();
      return val as number;
    },
  }),
});

// Source File Path State
export const sourceFilePathState = atom({
  key: 'sourceFilePathState',
  default: {
    path: '',
    timestamp: getTimestamp(),
  },
});

// Source File Name State
export const getSourceFilename = selector({
  key: 'sourceFilePathState/filename',
  get: ({ get }) => {
    const { path } = get(sourceFilePathState);
    return getBaseFilenameFromPath(path);
  },
});

// Uuid State
export const getUuid = selector({
  key: 'sourceFilePathState/uuid',
  get: ({ get }) => {
    const { timestamp } = get(sourceFilePathState);
    return timestamp;
  },
});

// Call Category Matching API
export const getCategory = selector({
  key: 'primaryCategoryState',
  get: async ({ get }) => {
    const { path } = get(sourceFilePathState);
    const uuid = get(getUuid);
    const category = startCategoryMatching(path, uuid);
    log.info('getCategory', category);
    return category;
  },
});

// Call Sub Category Matching API
export const getSubCategory = selector({
  key: 'subCategoryState',
  get: async ({ get }) => {
    const uuid = get(getUuid);
    const sub_category = startSubCategoryMatching(uuid);
    log.info('getSubCategory', sub_category);
    return sub_category;
  },
});

// SubCategory Info State
export const subCategoryInfoState = atom({
  key: 'subCategoryInfoState',
  default: selector({
    key: 'subCategoryInfoState/default',
    get: async ({ get }) => {
      // waiting for matching rule loaded.
      const rule = get(matchingRuleState);
      try {
        const res = await getSubCategoryInfo();
        log.info('subCategoryInfoState', res);
        return {
          available: true,
          name: res.name,
        };
      } catch (err) {
        log.error('subCategoryInfoState', err);
        return {
          available: false,
          name: '',
        };
      }
    },
  }),
});
