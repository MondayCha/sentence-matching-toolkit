use super::rule::AppState;
use crate::utils::classes::ClassInfo;
use crate::utils::classes::IntermediateClassInfo;
use crate::utils::classes::SubCategoryRule;
use crate::utils::paths;
use std::path::PathBuf;
use tauri::command;
use tauri::AppHandle;

#[command]
pub fn load_sub_category_rule(
    path: Option<&str>,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    if let Some(path) = path {
        let pathbuf = PathBuf::from(path);
        let mut rdr = match csv::Reader::from_path(&pathbuf) {
            Ok(rdr) => rdr,
            Err(e) => {
                return Err(format!("读取 CSV 文件失败：{}", e.to_string()).to_string());
            }
        };
        let mut classes = Vec::new();
        for result in rdr.deserialize() {
            let class_info: ClassInfo = match result {
                Ok(record) => record,
                Err(e) => {
                    return Err(format!("读取 CSV 行失败：{}", e.to_string()).to_string());
                }
            };
            classes.push(IntermediateClassInfo::from(&class_info));
        }
        let name = pathbuf.file_name().unwrap().to_str().unwrap().to_string();
        let sub_category_rule = SubCategoryRule {
            name: name.clone(),
            path: paths::sub_category_rule_path(&app_handle.path_resolver()).unwrap_or_default(),
            version: state.rule.read().unwrap().rule_version.clone(),
            classes,
        };
        sub_category_rule.save().unwrap();
        *state.sub_category.write().unwrap() = sub_category_rule;
        Ok(name.to_string())
    } else {
        let error_msg = "无法导入分类文件，请检查文件是否存在或者文件格式是否正确";
        if let Some(sub_category_rule_path) =
            paths::sub_category_rule_path(&app_handle.path_resolver())
        {
            if !sub_category_rule_path.exists() {
                return Err(error_msg.to_string());
            }
            // parse json to SubCategoryRule
            if let Some(mut sub_category_rule) =
                SubCategoryRule::from(&sub_category_rule_path, &app_handle.path_resolver())
            {
                sub_category_rule.path = sub_category_rule_path;
                let name = sub_category_rule.name.clone();
                *state.sub_category.write().unwrap() = sub_category_rule;
                return Ok(name.to_string());
            } else {
                return Err(error_msg.to_string());
            }
        } else {
            return Err(error_msg.to_string());
        }
    }
}
