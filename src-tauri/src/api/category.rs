use super::rule::AppState;
use crate::handler::category_handler::CategoryHandler;
use crate::handler::csv_handler::CsvHandler;
use crate::utils::errors::AResult;
use crate::utils::{records::base::*, records::category::*};
use tauri::command;
use tauri::AppHandle;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

/// `check_csv_headers` 检查 csv 文件是否有必要的列名，如果有则返回 csv 文件名，如果没有则返回错误。
#[command]
pub fn check_csv_headers(path: &str) -> AResult<(String, String, String)> {
    // check if file exists
    let csv_hander = CsvHandler::new(vec![
        "序号".to_string(),
        "提交时间".to_string(),
        "请选择单位所在地".to_string(),
        "姓名".to_string(),
        "单位".to_string(),
    ]);
    let csv_name = csv_hander.check_csv_availablity(path)?;
    Ok(csv_name)
}

/// Read csv records and serde to struct.
#[command]
pub fn start_category_matching(
    path: &str,
    uuid: &str,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> AResult<CategoryGroup> {
    let matching_rule = &state.rule.read().unwrap();

    let (category_group, category_group_path) =
        CategoryHandler::matching(uuid, path, matching_rule, &app_handle.path_resolver())?;

    *state.path.categories_path.write().unwrap() = category_group_path;
    Ok(category_group)
}

#[command]
pub fn receive_modified_records(
    records: Vec<BaseRecord>,
    uuid: &str,
    with_bom: bool,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> AResult<()> {
    let matching_rule = &state.rule.read().unwrap();
    let categories_path = &state.path.categories_path.read().unwrap();

    let accepted_records_path = CategoryHandler::receiving(
        uuid,
        categories_path,
        records,
        with_bom,
        matching_rule,
        &app_handle.path_resolver(),
    )?;

    *state.path.accepted_categories_path.write().unwrap() = accepted_records_path;
    Ok(())
}
