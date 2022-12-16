#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod api;
mod handler;
mod utils;

use std::collections::HashMap;
use std::fs;

use anyhow::Result;
use tauri::PathResolver;
use tauri_plugin_store::{PluginBuilder, StoreBuilder};

use api::{rule::AppState, *};
use utils::paths;

fn setup_dirs(path_resolver: &PathResolver) -> Result<()> {
    let cache_dir = paths::cache_dir(path_resolver)?;
    let history_dir = paths::history_dir(path_resolver)?;
    let config_dir = paths::config_dir(path_resolver)?;

    if !cache_dir.exists() {
        fs::create_dir_all(&cache_dir)?;
    }
    if !history_dir.exists() {
        fs::create_dir_all(&history_dir)?;
    }
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)?;
    }

    Ok(())
}

fn main() {
    let settings = StoreBuilder::new(".settings.dat".parse().unwrap())
        .defaults(HashMap::from([
            ("auto_import_dict".to_string(), true.into()),
            ("theme".to_string(), "dark".into()),
        ]))
        .build();

    tauri::Builder::default()
        .plugin(PluginBuilder::default().stores([settings]).freeze().build())
        .manage(AppState::default())
        .setup(|app| {
            setup_dirs(&app.path_resolver())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            rule::load_matching_rule,
            shell::close_splashscreen,
            shell::open_history_dir,
            shell::open_cache_dir,
            shell::remove_history_and_cache,
            category::check_csv_headers,
            category::start_category_matching,
            category::receive_modified_records,
            sub_category::load_class_csv,
            sub_category::get_sub_category_state,
            sub_category::start_sub_category_matching,
            dict::import_dictionary,
            dict::get_dict_size,
            dict::get_dict_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
