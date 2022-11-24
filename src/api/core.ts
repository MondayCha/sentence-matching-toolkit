import { invoke } from '@tauri-apps/api/tauri';
import log from '@/middleware/logger';

/**
 * Close Splashscreen, and load the main window.
 */
export const closeSplashscreen = () => invoke('close_splashscreen');

export const checkCsvAvailability = (path: string) => invoke('check_csv_headers', { path });

// export const startCategoryMatching = (dict: boolean) => invoke('start_category_matching', { dict });
export interface SourceRecord {
  序号: number;
  提交时间: string;
  请选择单位所在地: string;
  姓名: string;
  单位: string;
}

export const startCategoryMatching = async (path: string, enableDict: boolean) =>
  invoke('start_category_matching', { path, enableDict });
