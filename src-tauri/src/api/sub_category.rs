use super::rule::AppState;
use crate::utils::classes::ClassInfo;
use crate::utils::classes::IntermediateClassInfo;
use crate::utils::classes::SubCategoryCSV;
use crate::utils::classes::SubCategoryRegex;
use crate::utils::classes::SubCategoryRule;
use crate::utils::matches::RecordMatcher;
use crate::utils::paths;
use crate::utils::records;
use crate::utils::records::IntermediateRecord;
use std::fs::File;
use std::path::PathBuf;
use tauri::command;
use tauri::AppHandle;
use tauri::Window;

#[command]
pub fn load_class_csv(
    path: &str,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    let pathbuf = PathBuf::from(path);

    // read class info csv
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
    let sub_category_csv = SubCategoryCSV {
        name: name.clone(),
        classes,
    };
    let matching_rule = &mut *state.rule.write().unwrap();
    matching_rule
        .update_sub_category_csv(sub_category_csv)
        .unwrap();
    Ok(name.to_string())
}

#[command]
pub fn get_sub_category_state(state: tauri::State<'_, AppState>) -> Result<SubCategoryCSV, String> {
    let matching_rule = &*state.rule.read().unwrap();
    if let Some(sub_category) = &matching_rule.sub_category {
        Ok(sub_category.csv.clone())
    } else {
        Err("未加载分类信息".to_string())
    }
}

#[command]
pub fn start_sub_category_matching(
    path: &str,
    uuid: &str,
    state: tauri::State<'_, AppState>,
    window: Window,
    app_handle: AppHandle,
) -> Result<String, String> {
    let pathbuf = PathBuf::from(path);
    if !pathbuf.exists() {
        return Err(format!("文件 {} 不存在", &path).to_string());
    }

    let accepted_records_file = match File::open(&pathbuf) {
        Ok(file) => file,
        Err(_) => {
            return Err(format!("文件 {} 不存在", &path).to_string());
        }
    };
    let mut accepted_records: Vec<IntermediateRecord> =
        match serde_json::from_reader(accepted_records_file) {
            Ok(rule) => rule,
            Err(err) => {
                return Err(format!("格式错误 {:?}", err).to_string());
            }
        };

    let record_matcher = RecordMatcher::new(&state.rule.read().unwrap());
    let remove_category = |r: &str| record_matcher.remove_category(r);

    for record in accepted_records.iter() {
        // print!("{:?} ", record.info_t2s);
        if let Some(company_info) = record.parsed_company.as_ref() {
            let mut into_cleaned = company_info.all.clone();
            into_cleaned.replace_range(company_info.start..company_info.end, "");
            into_cleaned = remove_category(&into_cleaned);
            // println!("{:?}", into_cleaned);
        }
    }

    Ok("".to_string())
}
