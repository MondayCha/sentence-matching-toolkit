import { atom, selector } from 'recoil';
import { Store } from 'tauri-plugin-store-api';

import {
  getDictSize,
  getSubCategoryInfo,
  SourceRecord,
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

// Navigation Bar State
export const navIndexState = atom({
  key: 'navIndexState',
  default: NavIndex.Upload,
});

export const appStatusState = atom({
  key: 'appStatusState',
  default: AppStatus.Idle,
});

export const tempFilePathState = atom({
  key: 'tempFilePathState',
  default: '',
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
      //   await new Promise((res) => setTimeout(res, 1000 * 5));
      return val === true;
    },
  }),
});

// Dictionary State Selector
export const dictSizeState = atom({
  key: 'dictionarySizeState',
  default: selector({
    key: 'dictionarySizeState/default',
    get: async ({ get }) => {
      const path = get(sourceFilePathState);
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
    const path = get(tempFilePathState);
    const uuid = get(getUuid);
    const sub_category = startSubCategoryMatching(path, uuid);
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
