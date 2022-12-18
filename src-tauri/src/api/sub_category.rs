use super::rule::AppState;
use crate::handler::csv_handler::CsvHandler;
use crate::handler::sub_category_handler::SubCategoryHandler;
use crate::utils::classes::SubCategoryCSV;
use crate::utils::errors::AResult;
use crate::utils::errors::ChaosError;
use crate::utils::records::base::BaseRecord;
use crate::utils::records::sub_category::*;

use anyhow::anyhow;
use tauri::command;
use tauri::AppHandle;

#[command]
pub fn load_class_csv(path: &str, state: tauri::State<'_, AppState>) -> AResult<String> {
    let (sub_category_csv, csv_name) = CsvHandler::read_sub_category_csv(path)?;
    let matching_rule = &mut *state.rule.write().unwrap();
    matching_rule.update_sub_category_csv(sub_category_csv)?;
    Ok(csv_name)
}

#[command]
pub fn get_sub_category_state(state: tauri::State<'_, AppState>) -> AResult<SubCategoryCSV> {
    let matching_rule = &*state.rule.read().unwrap();
    if let Some(sub_category) = &matching_rule.sub_category {
        Ok(sub_category.csv.clone())
    } else {
        Err(ChaosError::Other(anyhow!("未加载分类信息")))
    }
}

#[command]
pub fn start_sub_category_matching(
    uuid: &str,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> AResult<SubCategoryGroup> {
    let matching_rule = &state.rule.read().unwrap();
    let dict_handler = &state.dict.read().unwrap();
    let accepted_categories_path = &state.path.accepted_categories_path.read().unwrap();

    let (sub_categories, sub_categories_path) = SubCategoryHandler::matching(
        uuid,
        accepted_categories_path,
        matching_rule,
        dict_handler,
        &app_handle.path_resolver(),
    )?;

    *state.path.sub_categories_path.write().unwrap() = sub_categories_path;

    Ok(sub_categories)
}

#[command]
pub fn rematch_sub_category(
    base: BaseRecord,
    name: &str,
    company: &str,
    state: tauri::State<'_, AppState>,
) -> AResult<SubCategory> {
    let matching_rule = &state.rule.read().unwrap();
    let dict_handler = &state.dict.read().unwrap();

    let sub_category =
        SubCategoryHandler::matching_one(&base, name, company, &matching_rule, &dict_handler)?;

    Ok(sub_category)
}

#[command]
pub fn receive_modified_sub_category(
    records: Vec<ModifiedSubCategory>,
    uuid: &str,
    with_bom: bool,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> AResult<()> {
    let matching_rule = &state.rule.read().unwrap();
    let sub_categories_path = &state.path.sub_categories_path.read().unwrap();

    let accepted_records_path = SubCategoryHandler::receiving(
        uuid,
        sub_categories_path,
        records,
        with_bom,
        matching_rule,
        &app_handle.path_resolver(),
    )?;

    *state.path.accepted_sub_categories_path.write().unwrap() = accepted_records_path;
    Ok(())
}
