use super::rule::AppState;
use crate::utils::classes::ClassInfo;
use crate::utils::classes::IntermediateClassInfo;
use crate::utils::classes::SubCategoryCSV;
use crate::utils::matches::SubCategoryMatcher;
use crate::utils::paths;
use crate::utils::records::category::*;
use crate::utils::records::sub_category::*;
use rayon::prelude::*;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use tauri::command;
use tauri::AppHandle;

#[command]
pub fn load_class_csv(path: &str, state: tauri::State<'_, AppState>) -> Result<String, String> {
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
        classes.push(IntermediateClassInfo::from(class_info));
    }

    let name = pathbuf.file_name().unwrap().to_str().unwrap().to_string();
    let sub_category_csv = SubCategoryCSV {
        name: name.clone(),
        available_grade: vec![],
        available_sequence: vec![],
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
    uuid: &str,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<SubCategoryGroup, String> {
    let path = &*state.path.accepted_categories_path.read().unwrap();
    let pathbuf = PathBuf::from(path);
    if !pathbuf.exists() {
        return Err(format!("文件 {} 不存在", path.to_string_lossy()).to_string());
    }

    let accepted_records_file = match File::open(&pathbuf) {
        Ok(file) => file,
        Err(_) => {
            return Err(format!("文件 {} 不存在", path.to_string_lossy()).to_string());
        }
    };
    let accepted_records: Vec<ModifiedCategory> =
        match serde_json::from_reader(accepted_records_file) {
            Ok(rule) => rule,
            Err(err) => {
                return Err(format!("格式错误 {:?}", err).to_string());
            }
        };

    let dict_handler = &*state.dict.read().unwrap();
    let get_name_from_dict = |r: &str| dict_handler.get_name_from_dict(r);

    let sub_category_matcher = match &state.rule.read().unwrap().sub_category {
        Some(sub_category) => SubCategoryMatcher::new(&sub_category, &dict_handler.dict_path),
        None => {
            return Err("未加载分类信息".to_string());
        }
    };
    let match_sub_category =
        |r: &str| sub_category_matcher.match_sub_category(r, &get_name_from_dict);

    let mut normal_records: Vec<SubCategory> = vec![];
    let mut incomplete_records: Vec<SubCategory> = vec![];
    let mut suspension_records: Vec<SubCategory> = vec![];
    let mut mismatch_records: Vec<SubCategory> = vec![];

    let sub_categories = accepted_records
        .par_iter()
        .map(|record| SubCategory::new(record.to_owned(), &match_sub_category))
        .collect::<Vec<SubCategory>>();

    for sub_record in sub_categories {
        match sub_record.flag {
            SubCategoryFlag::Normal => {
                normal_records.push(sub_record);
            }
            SubCategoryFlag::Incomplete => {
                incomplete_records.push(sub_record);
            }
            SubCategoryFlag::Suspension => {
                suspension_records.push(sub_record);
            }
            SubCategoryFlag::Mismatch => {
                mismatch_records.push(sub_record);
            }
        }
    }

    normal_records.sort_by(|a, b| {
        a.matched_class
            .cmp(&b.matched_class)
            .then(a.sub.company.cmp(&b.sub.company))
    });

    let sub_category_record_group = SubCategoryGroup {
        normal_records,
        incomplete_records,
        suspension_records,
        mismatch_records,
    };

    paths::history_sorted_class_path(&app_handle.path_resolver(), uuid).map(|path| {
        let accepted_records_data = serde_json::to_string(&sub_category_record_group).unwrap();
        let mut f = File::create(&path).unwrap();
        f.write_all(accepted_records_data.as_bytes()).unwrap();
        *state.path.sub_categories_path.write().unwrap() = path;
    });

    Ok(sub_category_record_group)
}
