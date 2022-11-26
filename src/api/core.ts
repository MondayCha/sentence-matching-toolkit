import { invoke } from '@tauri-apps/api/tauri';
import log from '@/middleware/logger';

/**
 * Close Splashscreen, and load the main window.
 */
export const closeSplashscreen = () => invoke('close_splashscreen');

export const checkCsvAvailability = (path: string) => invoke('check_csv_headers', { path });

// export const startCategoryMatching = (dict: boolean) => invoke('start_category_matching', { dict });
export interface SourceRecord {
  index: number;
  timestamp: string;
  location: string;
  name: string;
  company: string;
  info: string;
  infoT2s: string;
  infoJieba: string[];
  parsedCompany: string;
}

export interface SourceRecordGroup {
  acceptedRecords: SourceRecord[];
  rejectedRecords: SourceRecord[];
  inDictRecords: SourceRecord[];
  suspectedRecords: SourceRecord[];
}

export const startCategoryMatching = async (path: string, uuid: string) =>
  (await invoke('start_category_matching', { path, uuid })) as SourceRecordGroup;

// receive_modified_records
export const receiveModifiedRecords = (records: SourceRecord[], uuid: string) =>
  invoke('receive_modified_records', { records, uuid });

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
export const getSubCategoryInfo = () => invoke('get_sub_category_info');
