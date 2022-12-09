use std::fs::File;
use std::io::{Read, Write};

use crate::handler::t2s_handler::T2SHandler;
use crate::utils::matches::RecordMatcher;
use crate::utils::{paths, records::*};
use csv::Reader;
use tauri::api::dialog::message;
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
        message(Some(&parent_window), "注意", err_log.clone());
        Err(err_log)
    }
}

/// Read csv records and serde to struct.
#[command]
pub fn start_category_matching(
    path: &str,
    uuid: &str,
    state: tauri::State<'_, AppState>,
    window: Window,
    app_handle: AppHandle,
) -> Result<IntermediateRecordGroup, String> {
    // init window for sending message
    let label = window.label();
    let parent_window = window.get_window(label).unwrap();
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
            message(Some(&parent_window), "注意", &err_log);
        }
        return Err(err_log.to_string());
    }

    // create traditional to simplified handler
    let t2s_handler = T2SHandler::new();
    let t2s_convert = |s: &str| t2s_handler.convert(s);

    // create dict handler
    let dict_handler = crate::handler::dict_handler::DictHandler::new(&app_handle.path_resolver());

    // create matcher
    let record_matcher = RecordMatcher::new(&state.rule.read().unwrap());
    let match_category = |r: &str| record_matcher.match_category(r, &dict_handler);

    // read csv file
    let result_rdr = csv::Reader::from_path(path);
    let mut rdr = match result_rdr {
        Ok(rdr) => rdr,
        Err(e) => {
            err_log = format!("读取 CSV 文件失败：{}", e.to_string());
            message(Some(&parent_window), "注意", &err_log);
            return Err(err_log.to_string());
        }
    };

    let mut certainty_records = Vec::new();
    let mut probably_records = Vec::new();
    let mut possibility_records = Vec::new();
    let mut improbability_records = Vec::new();

    for result in rdr.deserialize() {
        let source_record: SourceRecord = match result {
            Ok(record) => record,
            Err(e) => {
                err_log = format!("读取 CSV 行失败：{}", e.to_string());
                message(Some(&parent_window), "注意", &err_log);
                return Err(err_log.to_string());
            }
        };
        let mut intermediate_record = IntermediateRecord::new(source_record, &t2s_convert);
        let (result, category) = match_category(&intermediate_record.info_t2s);
        intermediate_record.set_parsed_company(category);
        match result {
            RecordMatchingResult::Certainty => {
                certainty_records.push(intermediate_record);
            }
            RecordMatchingResult::Probably => {
                probably_records.push(intermediate_record);
            }
            RecordMatchingResult::Possibility => {
                possibility_records.push(intermediate_record);
            }
            RecordMatchingResult::Improbability => {
                improbability_records.push(intermediate_record);
            }
        }
    }

    certainty_records.sort_by(|a, b| {
        b.company
            .len()
            .cmp(&a.company.len())
            .then(a.company.cmp(&b.company))
    });
    probably_records.sort_by(|a, b| {
        a.company
            .cmp(&b.company)
            .then(b.name.len().cmp(&a.name.len()))
    });
    possibility_records.sort_by(|a, b| {
        a.company
            .cmp(&b.company)
            .then(b.name.len().cmp(&a.name.len()))
    });
    improbability_records.sort_by(|a, b| a.company.cmp(&b.company));

    if err_log.is_empty() {
        let intermediate_record_group = IntermediateRecordGroup {
            certainty_records,
            probably_records,
            possibility_records,
            improbability_records,
        };

        let option_record_group_path =
            crate::utils::paths::history_sorted_path(&app_handle.path_resolver(), uuid);
        if let Some(record_group_path) = option_record_group_path {
            let record_group_data = serde_json::to_string(&intermediate_record_group).unwrap();
            let mut f = File::create(record_group_path).unwrap();
            f.write_all(record_group_data.as_bytes()).unwrap();
        }

        Ok(intermediate_record_group)
    } else {
        message(Some(&parent_window), "注意", err_log.clone());
        Err(err_log)
    }
}

#[command]
pub fn receive_modified_records(
    mut records: Vec<IntermediateRecord>,
    uuid: &str,
    with_bom: bool,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    // create traditional to simplified handler
    let t2s_handler = T2SHandler::new();
    let t2s_convert = |s: &str| t2s_handler.convert(s);
    // create matcher
    let record_matcher = RecordMatcher::new(&state.rule.read().unwrap());
    let get_parsed_company = |r: &str| record_matcher.get_parsed_company(r);

    for record in records.iter_mut() {
        // record.parsed_company.is_none() || record.parsed_company.is_some_and(|&c| c.all.is_empty())
        if record.parsed_company.is_none()
            || (record.parsed_company.is_some()
                && record.parsed_company.as_ref().unwrap().all.is_empty())
        {
            // this record is added by user
            record.update_info(&t2s_convert);
            if let Some(category) = get_parsed_company(&record.info_t2s) {
                record.set_parsed_company(category);
            } else {
                return Err(format!("无法识别的组织：{}", &record.company));
            }
        } else {
            // user add record is only in the start of records
            break;
        }
    }

    let accepted_records_path =
        paths::history_accepted_path(&app_handle.path_resolver(), uuid).unwrap();
    let data = serde_json::to_string(&records).unwrap();
    let mut f = File::create(&accepted_records_path).unwrap();
    f.write_all(data.as_bytes()).unwrap();

    let option_accepted_records_csv_path =
        paths::history_accepted_csv_path(&app_handle.path_resolver(), uuid);
    if let Some(accepted_records_csv_path) = option_accepted_records_csv_path {
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

    Ok(accepted_records_path.to_str().unwrap().to_string())
}
