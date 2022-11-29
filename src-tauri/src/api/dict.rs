use std::fs::File;
use std::io::{BufRead, BufReader};

use crate::handler::dict_handler::{DictHandler, DictType};
use crate::utils::paths;
use tauri::command;
use tauri::AppHandle;

#[command]
pub fn get_dict_size(app_handle: AppHandle) -> usize {
    let dict_file_path = paths::dictionary_path(&app_handle.path_resolver());
    if let Some(dict_file_path) = dict_file_path {
        if !dict_file_path.exists() {
            return 0;
        }
        let dict_file = File::open(dict_file_path).unwrap();
        let reader = BufReader::new(dict_file);
        let mut count = 0;
        for _ in reader.lines() {
            count += 1;
        }
        count
    } else {
        0
    }
}

#[command]
pub fn get_dict_path(app_handle: AppHandle) -> String {
    let dict_file_path = paths::dictionary_path(&app_handle.path_resolver());
    if let Some(dict_file_path) = dict_file_path {
        if !dict_file_path.exists() {
            return "".to_string();
        }
        dict_file_path.into_os_string().into_string().unwrap()
    } else {
        "".to_string()
    }
}

/// Generate dictionary file and save to fs.
#[command]
pub fn import_dictionary(path: &str, app_handle: AppHandle) -> Result<usize, String> {
    let mut dict_handler = DictHandler::new(&app_handle.path_resolver());
    dict_handler
        .load_csv(path, Some(1), Some(DictType::PER))
        .unwrap();
    dict_handler.export_dict().unwrap();
    Ok(dict_handler.size)
}
