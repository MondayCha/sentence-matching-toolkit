use crate::{
    handler::dict_handler::DictHandler,
    utils::{paths, rules::MatchingRule},
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
) -> Result<String, String> {
    let path = match path {
        Some(path) => PathBuf::from(path),
        None => paths::rule_path(&app_handle.path_resolver()).unwrap_or_default(),
    };
    if let Some(rule) = MatchingRule::from(&path, &app_handle.path_resolver()) {
        // write rule message to dict
        let mut dict_handler = DictHandler::new(&app_handle.path_resolver());
        dict_handler.load_rule(&rule).unwrap();

        // save rule to state
        let name: String = rule.rule_name.clone();
        *state.rule.write().unwrap() = rule;

        // save dict to state
        *state.dict.write().unwrap() = dict_handler;

        Ok(name)
    } else {
        let mut err_log = "无法导入规则文件，请检查文件是否存在或者文件格式是否正确";
        // generate a template
        if let Err(_) = MatchingRule::generate_template(&app_handle.path_resolver()) {
            err_log = "无法导入规则文件，也无法生成规则模板";
        }
        Err(err_log.to_string())
    }
}
