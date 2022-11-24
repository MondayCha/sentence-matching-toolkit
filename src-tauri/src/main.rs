#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
use std::collections::HashMap;
use tauri::Manager;

use commands::{check_csv_headers, close_splashscreen, start_category_matching};
use tauri_plugin_store::{PluginBuilder, StoreBuilder};

fn main() {
    // let mut defaults = HashMap::new();
    // defaults.insert("foo".to_string(), "bar".into());
    // let builder = StoreBuilder::new("store.bin".parse()?).defaults(defaults);
    let settings = StoreBuilder::new(".settings.dat".parse().unwrap())
        .defaults(HashMap::from([
            ("dictionary".to_string(), true.into()),
            ("language".to_string(), "zh-CN".into()),
            ("rule".to_string(), "snzx".into()),
        ]))
        .build();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            check_csv_headers,
            start_category_matching
        ])
        .plugin(PluginBuilder::default().stores([settings]).freeze().build())
        .setup(|app| {
            let splashscreen_window = app.get_window("splashscreen").unwrap();
            let main_window = app.get_window("main").unwrap();
            // we perform the initialization code on a new task so the app doesn't freeze
            tauri::async_runtime::spawn(async move {
                // initialize your app here instead of sleeping :)
                println!("Initializing...");
                std::thread::sleep(std::time::Duration::from_secs(2));
                println!("Done initializing.");

                // After it's done, close the splashscreen and display the main window
                splashscreen_window.close().unwrap();
                main_window.show().unwrap();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
