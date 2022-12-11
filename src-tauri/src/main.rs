#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod api;
mod handler;
mod utils;

use std::collections::HashMap;
use std::fs;
use std::io::Result;

use api::{rule::AppState, *};
use tauri::{Manager, PathResolver};
use tauri_plugin_store::{PluginBuilder, StoreBuilder};
use utils::paths;

fn setup_dirs(path_resolver: &PathResolver) -> Result<()> {
    let option_cache_dir = paths::cache_dir(path_resolver);
    if let Some(cache_dir) = option_cache_dir {
        if !cache_dir.exists() {
            fs::create_dir_all(&cache_dir)?;
        }
    }
    let option_history_dir = paths::history_dir(path_resolver);
    if let Some(history_dir) = option_history_dir {
        if !history_dir.exists() {
            fs::create_dir_all(&history_dir)?;
        }
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
            // let splashscreen_window = app.get_window("splashscreen").unwrap();
            // let main_window = app.get_window("main").unwrap();
            // // we perform the initialization code on a new task so the app doesn't freeze
            // tauri::async_runtime::spawn(async move {
            //     // initialize your app here instead of sleeping :)
            //     println!("Initializing...");
            //     std::thread::sleep(std::time::Duration::from_secs(2));
            //     println!("Done initializing.");

            //     // After it's done, close the splashscreen and display the main window
            //     splashscreen_window.close().unwrap();
            //     main_window.show().unwrap();
            // });
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
