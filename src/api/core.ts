import { invoke } from '@tauri-apps/api/tauri';
import log from '@/middleware/logger';

export const enum AppStatus {
  NoRule,
  Idle,
  CanMatchCompany,
  CanMatchClass,
  ExportWithoutClass,
  ExportWithClass,
}

export interface BaseRecord {
  index: number;
  timestamp: string;
  location: string;
  name: string;
  company: string;
}

export interface CategoryItem {
  raw: BaseRecord;
  now: BaseRecord;
  cleaned?: {
    company: string;
    residue_1: string;
    residue_2: string;
  };
  flag: 'Certainty' | 'Probably' | 'Possibility' | 'Improbability';
}

export interface CategoryGroup {
  certaintyRecords: CategoryItem[];
  probablyRecords: CategoryItem[];
  possibilityRecords: CategoryItem[];
  improbabilityRecords: CategoryItem[];
}

export interface BaseCategoryGroup {
  shouldRerender: boolean;
  certaintyList: BaseRecord[];
  probablyList: BaseRecord[];
  possibilityList: BaseRecord[];
  improbabilityList: BaseRecord[];
  recycledList: BaseRecord[];
}

type NameFlag = 'Calc' | 'Dict' | 'Doubt';

export interface SubCategoryItem {
  raw: BaseRecord;
  cat: BaseRecord;
  sub: BaseRecord;
  matchedClass?: string;
  simularity: number;
  flag: 'Normal' | 'Incomplete' | 'Suspension' | 'Mismatch';
  nameFlag: NameFlag;
  nameCalc: string;
}

export interface SubCategoryGroup {
  normalRecords: SubCategoryItem[];
  incompleteRecords: SubCategoryItem[];
  suspensionRecords: SubCategoryItem[];
  mismatchRecords: SubCategoryItem[];
}

export type BaseSubCategoryGroup = SubCategoryGroup & {
  shouldRerender: boolean;
  recycledRecords: SubCategoryItem[];
  ruleRecords: SubCategoryItem[];
};

export interface ModifiedSubCategoryItem {
  index: number;
  name: string;
  matchedClass?: string;
  nameFlag: NameFlag;
}

export interface SubCategoyrCSV {
  name: string;
}

/**
 * Close Splashscreen, and load the main window.
 */
export const closeSplashscreen = () => invoke('close_splashscreen');

/**
 * Initialize the app, load the matching rule and the dictionary.
 * If path is null, last saved rule will be loaded.
 * @param path The path of the matching rule.
 * @returns The identifier of the matching rule.
 * @throws Error if the matching rule is not available.
 */
export const loadMatchingRule = async (path: string | null) =>
  (await invoke('load_matching_rule', { path })) as string;

// load_sub_category_csv
export const loadSubCategoryCSV = (path: string) => invoke('load_class_csv', { path });

/**
 * Check csv file's availability, return the name of the csv file if success.
 * @param path The path of the csv file.
 * @returns The name of the csv file.
 * @throws Error if the csv file is not available.
 */
export const checkCsvAvailability = async (path: string) =>
  (await invoke('check_csv_headers', { path })) as string[];

export const startCategoryMatching = async (path: string, uuid: string) =>
  (await invoke('start_category_matching', { path, uuid })) as CategoryGroup;

// start_sub_category_matching
export const startSubCategoryMatching = async (uuid: string) =>
  (await invoke('start_sub_category_matching', { uuid })) as SubCategoryGroup;

// receive_modified_records
export const receiveModifiedRecords = async (
  records: BaseRecord[],
  uuid: string,
  withBom: boolean
) => (await invoke('receive_modified_records', { records, uuid, withBom })) as string;

export const importDictionary = (path: string) => invoke('import_dictionary', { path });

// open_history_dir
export const openHistoryDir = () => invoke('open_history_dir');

// open_cache_dir
export const openCacheDir = () => invoke('open_cache_dir');

// remove_history_and_cache
export const removeHistoryAndCache = () => invoke('remove_history_and_cache');

// get_dict_size
export const getDictSize = async () => (await invoke('get_dict_size')) as number;

// get_dict_path
export const getDictPath = () => invoke('get_dict_path');

// get_sub_category_info
export const getSubCategoryInfo = async () =>
  (await invoke('get_sub_category_state')) as SubCategoyrCSV;

// rematch_sub_category
export const rematchSubCategory = async (
  base: BaseRecord,
  old: string,
  name: string,
  company: string
) => (await invoke('rematch_sub_category', { base, old, name, company })) as SubCategoryItem;

// receive_modified_records
export const receiveModifiedSubCategory = async (
  records: ModifiedSubCategoryItem[],
  uuid: string,
  withBom: boolean,
  autoImport: boolean
) =>
  (await invoke('receive_modified_sub_category', { records, uuid, withBom, autoImport })) as string;

// export_sub_category
export const exportSubCategory = async (path: string, withBom: boolean) =>
  (await invoke('export_sub_category', { path, withBom })) as string;

// get_vba_snippet
export const getVbaSnippet = async () => (await invoke('get_vba_snippet')) as string;

// load_user_replace
export const loadUserReplace = async (patterns: string[][]) =>
  await invoke('load_user_replace', { patterns });
