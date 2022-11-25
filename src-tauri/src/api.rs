use std::fs::File;
use std::io::{BufRead, BufReader};

use crate::handler::dict_handler::{DictHandler, DictType};
use crate::handler::jieba_handler::JiebaHandler;
use crate::handler::t2s_handler::T2SHandler;
use crate::utils::matches::RecordMatcher;
use crate::utils::{paths, records::*};
use csv::Reader;
use tauri::api::{dialog::message, shell::open};
use tauri::command;
use tauri::{AppHandle, Manager, Window};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

/// Close Splashscreen.
/// This command must be async so that it doesn't run on the main thread.
/// [Waiting for Rust](https://tauri.app/v1/guides/features/splashscreen#waiting-for-rust).
#[command]
pub async fn close_splashscreen(window: Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

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
    enable_dict: bool,
    window: Window,
    app_handle: AppHandle,
) -> Result<IntermediateRecordGroup, String> {
    // init window for sending message
    let label = window.label();
    let parent_window = window.get_window(label).unwrap();
    let mut err_log = String::new();

    // check if file exists
    if !std::path::Path::new(path).exists() {
        if path == "" {
            // default path
            err_log = "请先选择 CSV 文件！".to_string();
        } else {
            // file might be deleted
            err_log = format!("路径「{}」不存在！", path.to_string());
            message(Some(&parent_window), "注意", err_log.clone());
        }
        return Err(err_log.to_string());
    }

    // create traditional to simplified handler
    let t2s_handler = T2SHandler::new();
    let t2s_convert = |s: &str| t2s_handler.convert(s);

    // create jieba handler
    // let dict_path = paths::dictionary_path(&app_handle.path_resolver()).unwrap_or_default();
    // let jieba_handler = if enable_dict && dict_path.exists() {
    //     JiebaHandler::new(Some(&dict_path))
    // } else {
    //     JiebaHandler::new(None)
    // };
    // let jieba_cut = |s: &str| jieba_handler.cut(s);

    // create matcher
    let record_matcher = RecordMatcher::new();
    let match_category = |r: &str| record_matcher.match_category(r);

    // read csv file
    let mut rdr = csv::Reader::from_path(path).unwrap();
    let mut accepted_records = Vec::new();
    let mut suspected_records = Vec::new();
    let mut rejected_records = Vec::new();

    for result in rdr.deserialize() {
        let source_record: SourceRecord = result.unwrap();
        let mut intermediate_record = IntermediateRecord::new(source_record, &t2s_convert);
        let (result, category) = match_category(&intermediate_record.info_t2s);
        intermediate_record.set_parsed_company(category);
        match result {
            RecordMatchingResult::Accepted => {
                accepted_records.push(intermediate_record);
            }
            RecordMatchingResult::Suspected => {
                suspected_records.push(intermediate_record);
            }
            RecordMatchingResult::Rejected => {
                rejected_records.push(intermediate_record);
            }
        }
    }

    suspected_records.sort_by(|a, b| {
        let parsed_ordering = a.parsed_company.cmp(&b.parsed_company);
        if parsed_ordering == std::cmp::Ordering::Equal {
            b.company.len().cmp(&a.company.len())
        } else {
            parsed_ordering
        }
    });
    accepted_records.sort_by(|a, b| b.company.len().cmp(&a.company.len()));

    if err_log.is_empty() {
        Ok(IntermediateRecordGroup {
            accepted_records,
            suspected_records,
            rejected_records,
        })
    } else {
        message(Some(&parent_window), "注意", err_log.clone());
        Err(err_log)
    }
}

/// Generate dictionary file and save to fs.
#[command]
pub fn import_dictionary(path: &str, app_handle: AppHandle) -> Result<String, String> {
    let output_dict_path = paths::dictionary_path(&app_handle.path_resolver()).unwrap_or_default();
    println!("output_dict_path: {:?}", output_dict_path);
    let mut dict_handler =
        DictHandler::new(paths::dict_handler_path(&app_handle.path_resolver()).unwrap_or_default())
            .unwrap();
    dict_handler
        .load_csv(path, Some(1), Some(DictType::PER))
        .unwrap();
    dict_handler.export_dict(&output_dict_path).unwrap();
    Ok(output_dict_path.into_os_string().into_string().unwrap())
}

#[command]
pub fn open_history_dir(app_handle: AppHandle) {
    let history_dir = paths::history_dir(&app_handle.path_resolver())
        .unwrap_or_default()
        .into_os_string()
        .into_string()
        .unwrap();
    match open(&app_handle.shell_scope(), history_dir, None) {
        Ok(_) => {}
        Err(e) => {
            println!("open cache dir error: {:?}", e);
        }
    }
}

#[command]
pub fn open_cache_dir(app_handle: AppHandle) {
    let cache_dir = paths::cache_dir(&app_handle.path_resolver())
        .unwrap_or_default()
        .into_os_string()
        .into_string()
        .unwrap();
    match open(&app_handle.shell_scope(), cache_dir, None) {
        Ok(_) => {}
        Err(e) => {
            println!("open cache dir error: {:?}", e);
        }
    }
}

#[command]
pub fn get_dict_size(app_handle: AppHandle) -> usize {
    let dict_file_path = paths::dictionary_path(&app_handle.path_resolver());
    if let Some(dict_file_path) = dict_file_path {
        if !dict_file_path.exists() {
            return 0;
        }
        let dict_file = File::open(dict_file_path).unwrap();
        let reader = BufReader::new(dict_file);
        let mut count = 0;
        for _ in reader.lines() {
            count += 1;
        }
        count
    } else {
        0
    }
}

#[command]
pub fn get_dict_path(app_handle: AppHandle) -> String {
    let dict_file_path = paths::dictionary_path(&app_handle.path_resolver());
    if let Some(dict_file_path) = dict_file_path {
        if !dict_file_path.exists() {
            return "".to_string();
        }
        dict_file_path.into_os_string().into_string().unwrap()
    } else {
        "".to_string()
    }
}
