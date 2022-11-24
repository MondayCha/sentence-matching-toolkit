import { SourceRecord, startCategoryMatching } from '@/api/core';
import { Sleep } from '@icon-park/react';
import { atom, selector } from 'recoil';
import { Store } from 'tauri-plugin-store-api';
import log from '@/middleware/logger';

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

// Dictionary State Key
export const DICT_SETTING_KEY = 'dictionary';

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

// Source File Path State
export const sourceFilePathState = atom({
  key: 'sourceFilePathState',
  default: '',
});

// Call Category Matching API
export const primaryCategoryState = selector({
  key: 'primaryCategoryState',
  get: async ({ get }) => {
    const path = get(sourceFilePathState);
    const dict = get(dictState);
    const ans = await startCategoryMatching(path, dict);
    log.info('primaryCategoryState', ans);
    return ans as SourceRecord[];
  },
});
