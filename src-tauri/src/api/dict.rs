use crate::handler::dict_handler::DictHandler;
use crate::handler::dict_handler::DictType;
use crate::utils::errors::AResult;
use tauri::command;
use tauri::AppHandle;

use super::rule::AppState;

#[command]
pub fn get_dict_size(state: tauri::State<'_, AppState>) -> usize {
    let dict_handler = &*state.dict.read().unwrap();
    dict_handler.size()
}

#[command]
pub fn get_dict_path(app_handle: AppHandle) -> AResult<String> {
    let dict_path = DictHandler::get_dict_path(&app_handle.path_resolver())?;
    Ok(dict_path)
}

/// Generate dictionary file and save to fs.
#[command]
pub fn import_dictionary(path: &str, state: tauri::State<'_, AppState>) -> AResult<usize> {
    let dict_handler = &mut *state.dict.write().unwrap();
    dict_handler.load_csv(path, Some(1), Some(DictType::PER))?;
    Ok(dict_handler.size())
}
