use super::rule::AppState;
use crate::handler::csv_handler::CsvHandler;
use crate::handler::dict_handler::DictType;
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
    old: &str,     // 旧的班级
    name: &str,    // 新的姓名
    company: &str, // 新的单位
    state: tauri::State<'_, AppState>,
) -> AResult<SubCategory> {
    let matching_rule = &state.rule.read().unwrap();
    let dict_handler = &state.dict.read().unwrap();

    let mut sub_category =
        SubCategoryHandler::matching_one(&base, name, company, &matching_rule, &dict_handler)?;

    if matches!(sub_category.flag, SubCategoryFlag::Normal) {
        let new_user_input_class = sub_category.sub.company.clone();
        let old_user_input_class = old.replace(&sub_category.sub.name, "");
        println!(
            "new_user_input_class: {}, old_user_input_class: {}",
            new_user_input_class, old_user_input_class
        );
        sub_category.cat.index = -1;
        sub_category.cat.company = old_user_input_class;
    }

    Ok(sub_category)
}

#[command]
pub fn receive_modified_sub_category(
    records: Vec<ModifiedSubCategory>,
    uuid: &str,
    with_bom: bool,
    auto_import: bool,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> AResult<()> {
    let matching_rule = &state.rule.read().unwrap();
    let sub_categories_path = &state.path.sub_categories_path.read().unwrap();

    let (accepted_records_path, names) = SubCategoryHandler::receiving(
        uuid,
        sub_categories_path,
        records,
        with_bom,
        auto_import,
        matching_rule,
        &app_handle.path_resolver(),
    )?;

    *state.path.accepted_sub_categories_path.write().unwrap() = accepted_records_path;
    if let Some(names) = names {
        let dict_handler = &mut *state.dict.write().unwrap();
        dict_handler.load_vec(names, Some(DictType::PER))?;
    }
    Ok(())
}
