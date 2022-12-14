use std::collections::HashMap;
use std::fs::File;
use std::io::{Read, Write};

use crate::handler::t2s_handler::T2SHandler;
use crate::utils::matches::CategoryMatcher;
use crate::utils::{paths, records::base::*, records::category::*};
use csv::Reader;
use rayon::prelude::*;
use tauri::command;
use tauri::{AppHandle, Manager, Window};

use super::rule::AppState;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

/// Receive csv file path and check csv availablity.
#[command]
pub fn check_csv_headers(path: &str, window: Window) -> Result<String, String> {
    // check if file exists
    if !std::path::Path::new(path).exists() {
        return Err("File not found".to_string());
    }
    let mut rdr = Reader::from_path(path).unwrap();
    let headers = rdr.headers().unwrap();

    let label = window.label();
    let parent_window = window.get_window(label).unwrap();

    let mut err_log = String::new();
    if headers.len() != 5 {
        err_log = format!(
            "输入 CSV 文件应有 5 列，检测到 {} 列，不符合要求。",
            headers.len()
        );
    } else if headers[3].to_string() != "姓名" {
        err_log = format!(
            "输入 CSV 文件第 4 列应为「姓名」，检测到第 4 列为「{}」，不符合要求。",
            headers[3].to_string()
        );
    } else if headers[4].to_string() != "单位" {
        err_log = format!(
            "输入 CSV 文件第 5 列应为「单位」，检测到第 5 列为「{}」，不符合要求。",
            headers[4].to_string()
        );
    }

    if err_log.is_empty() {
        Ok(headers[0].to_string())
    } else {
        Err(err_log)
    }
}

/// Read csv records and serde to struct.
#[command]
pub fn start_category_matching(
    path: &str,
    uuid: &str,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<CategoryGroup, String> {
    let mut err_log = String::new();

    // create folder in APP_DATA/history/uuid (history_uuid_dir)
    let option_uuid_dir = crate::utils::paths::history_uuid_dir(&app_handle.path_resolver(), uuid);
    if let Some(uuid_dir) = option_uuid_dir {
        // !history_uuid_dir.exists() {
        // std::fs::create_dir_all(&history_uuid_dir).unwrap();
        if uuid_dir.exists() {
            return Err("UUID 目录已存在，请检查 UUID 是否重复。".to_string());
        } else {
            std::fs::create_dir_all(&uuid_dir).unwrap();
        }
    } else {
        return Err("无法创建历史文件夹".to_string());
    }

    // check if file exists
    if !std::path::Path::new(path).exists() {
        if path == "" {
            // default path
            err_log = "请先选择 CSV 文件！".to_string();
        } else {
            // file might be deleted
            err_log = format!("路径「{}」不存在！", path.to_string());
        }
        return Err(err_log);
    }

    // create traditional to simplified handler
    let t2s_handler = T2SHandler::new();
    let t2s_convert = |s: &str| t2s_handler.convert(s);

    // create matcher
    let record_matcher = CategoryMatcher::new(&state.rule.read().unwrap());
    let fff = |s1: &str, s2: &str| false;
    let match_category = |r1: &str, r2: &str| record_matcher.match_category(r1, r2, &fff);

    // read csv file
    let result_rdr = csv::Reader::from_path(path);
    let mut rdr = match result_rdr {
        Ok(rdr) => rdr,
        Err(e) => {
            err_log = format!("读取 CSV 文件失败：{}", e.to_string());
            return Err(err_log);
        }
    };

    let mut certainty_records = Vec::new();
    let mut probably_records = Vec::new();
    let mut possibility_records = Vec::new();
    let mut improbability_records = Vec::new();

    let mut base_records = Vec::new();

    for result in rdr.deserialize() {
        let source_record: SourceRecord = match result {
            Ok(record) => record,
            Err(e) => {
                err_log = format!("读取 CSV 行失败：{}", e.to_string());
                return Err(err_log);
            }
        };
        base_records.push(BaseRecord::from(source_record));
    }

    let categories = base_records
        .par_iter()
        .map(|base_record| Category::new(base_record, &t2s_convert, &match_category))
        .collect::<Vec<Category>>();

    for category in categories {
        match category.flag {
            CategoryFlag::Certainty => {
                certainty_records.push(category);
            }
            CategoryFlag::Probably => {
                probably_records.push(category);
            }
            CategoryFlag::Possibility => {
                possibility_records.push(category);
            }
            CategoryFlag::Improbability => {
                improbability_records.push(category);
            }
        }
    }

    certainty_records.sort_by(|a, b| {
        b.raw
            .company
            .len()
            .cmp(&a.raw.company.len())
            .then(a.raw.company.cmp(&b.raw.company))
    });
    probably_records.sort_by(|a, b| {
        a.raw
            .company
            .cmp(&b.raw.company)
            .then(b.raw.name.len().cmp(&a.raw.name.len()))
    });
    possibility_records.sort_by(|a, b| {
        a.raw
            .company
            .cmp(&b.raw.company)
            .then(b.raw.name.len().cmp(&a.raw.name.len()))
    });
    improbability_records.sort_by(|a, b| a.raw.company.cmp(&b.raw.company));

    if err_log.is_empty() {
        let category_group = CategoryGroup {
            certainty_records,
            probably_records,
            possibility_records,
            improbability_records,
        };

        if let Some(record_group_path) =
            paths::history_sorted_path(&app_handle.path_resolver(), uuid)
        {
            let record_group_data = serde_json::to_string(&category_group).unwrap();
            let mut f = File::create(&record_group_path).unwrap();
            f.write_all(record_group_data.as_bytes()).unwrap();
            *state.path.categories_path.write().unwrap() = record_group_path;
        }

        Ok(category_group)
    } else {
        Err(err_log)
    }
}

#[command]
pub fn receive_modified_records(
    records: Vec<BaseRecord>,
    uuid: &str,
    with_bom: bool,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    // create matcher
    let record_matcher = CategoryMatcher::new(&state.rule.read().unwrap());
    let fff = |_: &str, _: &str| false;
    let match_category = |r1: &str, r2: &str| record_matcher.match_category(r1, r2, &fff);

    // load records map indexed by index from record_group_path
    let mut records_map = HashMap::new();
    let record_group_path = &*state.path.categories_path.read().unwrap();
    let mut f = File::open(record_group_path).unwrap();
    let mut record_group_data = String::new();
    f.read_to_string(&mut record_group_data).unwrap();
    let category_group: CategoryGroup = serde_json::from_str(&record_group_data).unwrap();
    for record in category_group.certainty_records {
        records_map.insert(record.raw.index, record);
    }
    for record in category_group.probably_records {
        records_map.insert(record.raw.index, record);
    }
    for record in category_group.possibility_records {
        records_map.insert(record.raw.index, record);
    }
    for record in category_group.improbability_records {
        records_map.insert(record.raw.index, record);
    }

    // update records
    let mut modified_records = Vec::new();

    for record in records.iter() {
        // put record into modified_records
        if records_map.contains_key(&record.index) {
            let category = records_map.get(&record.index).unwrap().clone();

            let modified_record =
                if category.now.name != record.name || category.now.company != record.company {
                    // category has been modified, rematch it
                    let category_result = match_category(&record.name, &record.company);
                    ModifiedCategory {
                        raw: category.raw,
                        old: category.now,
                        new: record.clone(),
                        cleaned: match category_result {
                            CategoryResult::Certainty(cleaned) => Some(cleaned),
                            CategoryResult::Probably(_) => category.cleaned,
                            CategoryResult::Possibility(_) => category.cleaned,
                            CategoryResult::Improbability => category.cleaned,
                        },
                        flag: category.flag,
                    }
                    // extract modified string as new replace rule
                    // TODO!
                } else {
                    ModifiedCategory {
                        raw: category.raw,
                        old: category.now,
                        new: record.clone(),
                        cleaned: category.cleaned,
                        flag: category.flag,
                    }
                };
            modified_records.push(modified_record);
        }
    }

    modified_records.sort_by(|a, b| a.raw.index.cmp(&b.raw.index));

    if let Some(accepted_records_path) =
        paths::history_accepted_path(&app_handle.path_resolver(), uuid)
    {
        // save modified_records to accepted_records_path in json format
        let data = serde_json::to_string(&modified_records).unwrap();
        let mut f = File::create(&accepted_records_path).unwrap();
        f.write_all(data.as_bytes()).unwrap();

        // save the "new" in modified_records to accepted_records_csv_path in csv format
        if let Some(accepted_records_csv_path) =
            paths::history_accepted_csv_path(&app_handle.path_resolver(), uuid)
        {
            let mut wtr = csv::Writer::from_path(&accepted_records_csv_path).unwrap();
            for record in records {
                let sr = SourceRecord::from(record);
                wtr.serialize(sr).unwrap();
            }

            // if params.with_bom is true, reopen csv file, add BOM to the head
            if with_bom {
                let mut f = File::open(&accepted_records_csv_path).unwrap();
                let mut content = String::new();
                f.read_to_string(&mut content).unwrap();
                let mut f = File::create(&accepted_records_csv_path).unwrap();
                f.write_all(b"\xEF\xBB\xBF").unwrap();
                f.write_all(content.as_bytes()).unwrap();
            }
        }
        *state.path.accepted_categories_path.write().unwrap() = accepted_records_path;
        Ok("".to_string())
    } else {
        Err("无法创建文件".to_string())
    }
}
