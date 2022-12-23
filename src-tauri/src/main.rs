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
    } else {
        // remove history_uuid_dir (history_dir/2022.11.25_15.00.00/) 1 days ago
        let history_uuid_dirs = fs::read_dir(&history_dir)?;
        for history_uuid_dir in history_uuid_dirs {
            let history_uuid_dir = history_uuid_dir?;
            let history_uuid_dir_path = history_uuid_dir.path();
            let history_uuid_dir = history_uuid_dir_path.to_str().unwrap();
            // split / or \\ to get last element
            let history_uuid_dir = history_uuid_dir
                .split(|c| c == '/' || c == '\\')
                .last()
                .unwrap();
            let history_uuid_dir =
                chrono::NaiveDateTime::parse_from_str(history_uuid_dir, "%Y.%m.%d_%H.%M.%S");
            if let Ok(history_uuid_dir) = history_uuid_dir {
                let now = chrono::Local::now().naive_local();
                let diff = now - history_uuid_dir;
                if diff.num_days() > 1 {
                    fs::remove_dir_all(&history_uuid_dir_path)?;
                }
            }
        }
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
            rule::load_user_replace,
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
            sub_category::rematch_sub_category,
            sub_category::receive_modified_sub_category,
            dict::import_dictionary,
            dict::get_dict_size,
            dict::get_dict_path,
            export::export_sub_category,
            export::get_vba_snippet,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
