import { invoke } from '@tauri-apps/api/tauri';
import log from '@/middleware/logger';

export const enum AppStatus {
  Idle = 0,
  CanMatch1,
  CanMatch2,
  CanExport1,
  CanExport2,
}

export interface SourceRecord {
  index: number;
  timestamp: string;
  location: string;
  name: string;
  company: string;
  info: string;
  infoT2s: string;
  infoJieba: string[];
  parsedName?: string;
  parsedClass?: [number, string, string];
  matchedClass?: string;
  parsedCompany?: {
    all: string;
    name: string;
    start: number;
    end: number;
  };
}

export interface CategoryGroup {
  certaintyRecords: SourceRecord[];
  probablyRecords: SourceRecord[];
  possibilityRecords: SourceRecord[];
  improbabilityRecords: SourceRecord[];
}

export interface SubCategoryGroup {
  normalRecords: SourceRecord[];
  incompleteRecords: SourceRecord[];
  suspensionRecords: SourceRecord[];
  mismatchRecords: SourceRecord[];
}

export interface SubCategoyrCSV {
  name: string;
}

/**
 * Close Splashscreen, and load the main window.
 */
export const closeSplashscreen = () => invoke('close_splashscreen');

export const checkCsvAvailability = (path: string) => invoke('check_csv_headers', { path });

export const startCategoryMatching = async (path: string, uuid: string) =>
  (await invoke('start_category_matching', { path, uuid })) as CategoryGroup;

// start_sub_category_matching
export const startSubCategoryMatching = async (path: string, uuid: string) =>
  (await invoke('start_sub_category_matching', { path, uuid })) as SubCategoryGroup;

// receive_modified_records
export const receiveModifiedRecords = async (
  records: SourceRecord[],
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
export const getDictSize = () => invoke('get_dict_size');

// get_dict_path
export const getDictPath = () => invoke('get_dict_path');

// get_sub_category_info
export const getSubCategoryInfo = async () =>
  (await invoke('get_sub_category_state')) as SubCategoyrCSV;

// load_sub_category_csv
export const loadSubCategoryCSV = (path: string) => invoke('load_class_csv', { path });

// load_matching_rule
export const loadMatchingRule = (path: string | null) => invoke('load_matching_rule', { path });
