import { invoke } from "@tauri-apps/api/tauri";

/**
 * Close Splashscreen, and load the main window.
 */
export const closeSplashscreen = () => invoke("close_splashscreen");

export const checkCsvAvailability = (path: string) =>
  invoke("check_csv_headers", { path });
