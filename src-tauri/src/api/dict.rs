use crate::handler::dict_handler::DictType;
use crate::utils::paths;
use tauri::command;
use tauri::AppHandle;

use super::rule::AppState;

#[command]
pub fn get_dict_size(state: tauri::State<'_, AppState>) -> usize {
    let dict_handler = &*state.dict.read().unwrap();
    dict_handler.size()
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
pub fn import_dictionary(path: &str, state: tauri::State<'_, AppState>) -> Result<usize, String> {
    let dict_handler = &mut *state.dict.write().unwrap();
    dict_handler
        .load_csv(path, Some(1), Some(DictType::PER))
        .unwrap();
    Ok(dict_handler.size())
}
