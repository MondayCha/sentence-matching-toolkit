import uuid from 'react-uuid';
import { atom, selector } from 'recoil';
import { Store } from 'tauri-plugin-store-api';

import { getDictSize, SourceRecord, startCategoryMatching } from '@/api/core';
import log from '@/middleware/logger';
import { getBaseFilenameFromPath } from './utils';

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
  default: '',
});

// Source File Name State
export const getSourceFilename = selector({
  key: 'sourceFilePathState/filename',
  get: ({ get }) => {
    const path = get(sourceFilePathState);
    return getBaseFilenameFromPath(path);
  },
});

// Uuid State
export const getUuid = selector({
  key: 'sourceFilePathState/uuid',
  get: ({ get }) => {
    const path = get(sourceFilePathState);
    return uuid();
  },
});

// Call Category Matching API
export const getCategory = selector({
  key: 'primaryCategoryState',
  get: async ({ get }) => {
    const path = get(sourceFilePathState);
    const dict = get(dictState);
    const uuid = get(getUuid);
    const category = startCategoryMatching(path, uuid, dict);
    log.info('getCategory', category);
    return category;
  },
});
