use crate::utils::errors::AResult;
use crate::utils::paths::{self, pathbuf_to_string};

use anyhow::Result;
use tauri::api::shell::open;
use tauri::command;
use tauri::{AppHandle, Manager, Window};

fn call_open_history_dir(app_handle: &AppHandle) -> Result<()> {
    let history_dir = paths::history_dir(&app_handle.path_resolver())?;
    let history_dir_str = pathbuf_to_string(&history_dir)?;
    open(&app_handle.shell_scope(), history_dir_str, None)?;
    Ok(())
}

fn call_open_cache_dir(app_handle: &AppHandle) -> Result<()> {
    let cache_dir = paths::cache_dir(&app_handle.path_resolver())?;
    let cache_dir_str = pathbuf_to_string(&cache_dir)?;
    open(&app_handle.shell_scope(), cache_dir_str, None)?;
    Ok(())
}

/// Close Splashscreen.
/// This command must be async so that it doesn't run on the main thread.
/// [Waiting for Rust](https://tauri.app/v1/guides/features/splashscreen#waiting-for-rust).
#[command]
pub async fn close_splashscreen(window: Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

#[command]
pub fn open_history_dir(app_handle: AppHandle) -> AResult<()> {
    call_open_history_dir(&app_handle)?;
    Ok(())
}

#[command]
pub fn open_cache_dir(app_handle: AppHandle) -> AResult<()> {
    call_open_cache_dir(&app_handle)?;
    Ok(())
}

#[command]
pub fn remove_history_and_cache(app_handle: AppHandle) -> Result<(), String> {
    let history_dir = paths::history_dir(&app_handle.path_resolver()).unwrap();
    let cache_dir = paths::cache_dir(&app_handle.path_resolver()).unwrap();
    match std::fs::remove_dir_all(&history_dir) {
        Ok(_) => {}
        Err(_) => {
            return Err("remove history dir error".to_string());
        }
    }
    match std::fs::remove_dir_all(&cache_dir) {
        Ok(_) => {}
        Err(_) => {
            return Err("remove cache dir error".to_string());
        }
    }
    match std::fs::create_dir_all(history_dir) {
        Ok(_) => {}
        Err(_) => {
            return Err("create history dir error".to_string());
        }
    }
    match std::fs::create_dir_all(cache_dir) {
        Ok(_) => {}
        Err(_) => {
            return Err("create cache dir error".to_string());
        }
    }
    Ok(())
}
