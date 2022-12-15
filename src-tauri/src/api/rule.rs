use crate::{
    handler::dict_handler::DictHandler,
    utils::{errors::AResult, rules::MatchingRule},
};
use std::path::PathBuf;
use std::sync::RwLock;
use tauri::AppHandle;

#[derive(Default)]
pub struct IntermediatePaths {
    pub categories_path: RwLock<PathBuf>,
    pub accepted_categories_path: RwLock<PathBuf>,
    pub sub_categories_path: RwLock<PathBuf>,
    pub accepted_sub_categories_path: RwLock<PathBuf>,
}

#[derive(Default)]
pub struct AppState {
    pub rule: RwLock<MatchingRule>,
    pub dict: RwLock<DictHandler>,
    pub path: IntermediatePaths,
}

#[tauri::command]
pub async fn load_matching_rule(
    path: Option<&str>,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> AResult<String> {
    let rule = MatchingRule::new(path, &app_handle.path_resolver())?;
    // write rule message to dict
    let mut dict_handler = DictHandler::new(&app_handle.path_resolver())?;
    dict_handler.load_rule(&rule)?;

    // save rule to state
    let name: String = rule.rule_name.clone();
    *state.rule.write().unwrap() = rule;

    // save dict to state
    *state.dict.write().unwrap() = dict_handler;

    Ok(name)
}
