use super::rule::AppState;
use crate::utils::classes::ClassInfo;
use crate::utils::classes::IntermediateClassInfo;
use crate::utils::classes::SubCategoryCSV;
use crate::utils::classes::SubCategoryRegex;
use crate::utils::classes::SubCategoryRule;
use crate::utils::matches::RecordMatcher;
use crate::utils::matches::SubCategoryMatchResult;
use crate::utils::matches::SubCategoryMatcher;
use crate::utils::paths;
use crate::utils::records;
use crate::utils::records::IntermediateRecord;
use crate::utils::records::SubCategoryRecordGroup;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use tauri::command;
use tauri::AppHandle;
use tauri::Window;

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
        classes.push(IntermediateClassInfo::from(&class_info));
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
    path: &str,
    uuid: &str,
    state: tauri::State<'_, AppState>,
    window: Window,
    app_handle: AppHandle,
) -> Result<SubCategoryRecordGroup, String> {
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
    let get_chinese = |r: &str| record_matcher.get_chinese(r);

    let dict_path = paths::dictionary_path(&app_handle.path_resolver()).unwrap_or_default();
    let sub_category_matcher = match &state.rule.read().unwrap().sub_category {
        Some(sub_category) => SubCategoryMatcher::new(&sub_category, &dict_path),
        None => {
            return Err("未加载分类信息".to_string());
        }
    };

    let mut normal_records: Vec<IntermediateRecord> = vec![];
    let mut incomplete_records: Vec<IntermediateRecord> = vec![];
    let mut suspension_records: Vec<IntermediateRecord> = vec![];
    let mut mismatch_records: Vec<IntermediateRecord> = vec![];

    for record in accepted_records.iter_mut() {
        println!("{:?} ", record.info_t2s);
        if let Some(company_info) = record.parsed_company.as_ref() {
            let mut without_company_info = company_info.all.clone();
            without_company_info.replace_range(company_info.start..company_info.end, "");
            without_company_info = remove_category(&without_company_info);
            let replaced_record = sub_category_matcher.replace(&without_company_info);
            // println!("{:?}", splitted_record);
            match sub_category_matcher.match_sub_category(&replaced_record) {
                SubCategoryMatchResult::Normal(similarity, sub_category) => {
                    println!("Normal: {} {}", similarity, sub_category.name);
                    let (t_name, t_class) = sub_category_matcher
                        .split_name_and_subcategory(&replaced_record, &sub_category.name);
                    println!("\nName is: {} {}", get_chinese(&t_name), &t_class);
                    record.set_name_and_class(
                        Some(get_chinese(&t_name)),
                        Some((similarity, t_class, without_company_info)),
                        Some(sub_category.name),
                    );
                    normal_records.push(record.clone());
                }
                SubCategoryMatchResult::Incomplete => {
                    println!("Incomplete");
                    record.set_name_and_class(Some(get_chinese(&record.name)), None, None);
                    incomplete_records.push(record.clone());
                }
                SubCategoryMatchResult::Suspension => {
                    println!("Suspension");
                    record.set_name_and_class(Some(get_chinese(&record.name)), None, None);
                    suspension_records.push(record.clone());
                }
                SubCategoryMatchResult::Mismatch => {
                    println!("No Match");
                    record.set_name_and_class(Some(get_chinese(&record.name)), None, None);
                    mismatch_records.push(record.clone());
                }
            }
        }
        println!("----------------\n");
    }

    normal_records.sort_by(|a, b| {
        a.matched_class
            .cmp(&b.matched_class)
            .then(a.company.cmp(&b.company))
    });

    let sub_category_record_group = SubCategoryRecordGroup {
        normal_records,
        incomplete_records,
        suspension_records,
        mismatch_records,
    };

    paths::history_sorted_class_path(&app_handle.path_resolver(), uuid).map(|path| {
        let accepted_records_data = serde_json::to_string(&sub_category_record_group).unwrap();
        let mut f = File::create(path).unwrap();
        f.write_all(accepted_records_data.as_bytes()).unwrap();
    });

    Ok(sub_category_record_group)
}
