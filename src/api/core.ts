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
}

export interface SourceRecordGroup {
  acceptedRecords: SourceRecord[];
  rejectedRecords: SourceRecord[];
  suspectedRecords: SourceRecord[];
}

export const startCategoryMatching = async (path: string, uuid: string, enableDict: boolean) =>
  (await invoke('start_category_matching', { path, uuid, enableDict })) as SourceRecordGroup;

export const importDictionary = (path: string) => invoke('import_dictionary', { path });

// open_history_dir
export const openHistoryDir = () => invoke('open_history_dir');

// open_cache_dir
export const openCacheDir = () => invoke('open_cache_dir');

// get_dict_size
export const getDictSize = () => invoke('get_dict_size');

// get_dict_path
export const getDictPath = () => invoke('get_dict_path');
