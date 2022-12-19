use anyhow::{anyhow, Result};
use std::path::{Path, PathBuf};
use tauri::PathResolver;

fn get_current_time() -> String {
    use chrono::prelude::*;
    let now: DateTime<Utc> = Utc::now();
    now.format("%H_%M_%S").to_string()
}

pub fn get_filename_from_path(path: &Path) -> (String, String, String) {
    let filename = path
        .file_name()
        .map(|os_s| {
            os_s.to_str()
                .map(|s| s.to_string())
                .unwrap_or_else(|| "".to_string())
        })
        .unwrap_or_else(|| "".to_string());
    let filename_without_extension = filename.split('.').next().unwrap_or("").to_string();
    let parent_dir = path
        .parent()
        .map(|os_s| {
            os_s.to_str()
                .map(|s| s.to_string())
                .unwrap_or_else(|| "".to_string())
        })
        .unwrap_or_else(|| "".to_string());
    (filename, filename_without_extension, parent_dir)
}

pub fn pathbuf_to_string(pathbuf: &PathBuf) -> Result<String> {
    let str = pathbuf
        .clone()
        .into_os_string()
        .into_string()
        .map_err(|os_str| anyhow!("Convert os_string into string failed: {:?}", os_str))?;
    Ok(str)
}

///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////          Folders           /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/// $APP_CACHE/history/
pub fn history_dir(path_resolver: &PathResolver) -> Result<PathBuf> {
    if let Some(app_data_dir) = path_resolver.app_cache_dir() {
        Ok(app_data_dir.join("history"))
    } else {
        Err(anyhow!("无法生成历史文件夹路径"))
    }
}

/// $APP_DATA/cache/
pub fn cache_dir(path_resolver: &PathResolver) -> Result<PathBuf> {
    if let Some(app_cache_dir) = path_resolver.app_data_dir() {
        Ok(app_cache_dir.join("cache"))
    } else {
        Err(anyhow!("无法生成缓存文件夹路径"))
    }
}

/// $APP_DATA/config/
pub fn config_dir(path_resolver: &PathResolver) -> Result<PathBuf> {
    if let Some(app_data_dir) = path_resolver.app_data_dir() {
        Ok(app_data_dir.join("config"))
    } else {
        Err(anyhow!("无法生成配置文件夹路径"))
    }
}

/// $APP_DATA/history/2022-11-25-15-00-00/
pub fn history_uuid_dir(path_resolver: &PathResolver, uuid: &str) -> Result<PathBuf> {
    let history_dir = history_dir(path_resolver)?;
    Ok(history_dir.join(uuid))
}

///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////           Files            /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/// $APP_CACHE/cache/dict.txt
pub fn dictionary_path(path_resolver: &PathResolver) -> Result<PathBuf> {
    let dict_dir = cache_dir(path_resolver)?;
    Ok(dict_dir.join("dict.txt"))
}

/// $APP_CACHE/cache/relations.json
pub fn relations_path(path_resolver: &PathResolver) -> Result<PathBuf> {
    let dict_dir = cache_dir(path_resolver)?;
    Ok(dict_dir.join("relations.json"))
}

/// $APP_DATA/history/2022-11-25-15-00-00/1_sorted_records.json
pub fn history_sorted_path(path_resolver: &PathResolver, uuid: &str) -> Result<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    Ok(history_today_dir.join(format!("1_sorted_records_{}.json", get_current_time())))
}

/// $APP_DATA/history/2022-11-25-15-00-00/2_accepted_records.json
pub fn history_accepted_path(path_resolver: &PathResolver, uuid: &str) -> Result<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    Ok(history_today_dir.join(format!("2_accepted_records_{}.json", get_current_time())))
}

/// $APP_DATA/history/2022-11-25-15-00-00/2_accepted_records.csv
pub fn history_accepted_csv_path(path_resolver: &PathResolver, uuid: &str) -> Result<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    Ok(history_today_dir.join(format!("2_accepted_records_{}.csv", get_current_time())))
}

/// $APP_DATA/history/2022-11-25-15-00-00/3_sorted_records.json
pub fn history_sorted_class_path(path_resolver: &PathResolver, uuid: &str) -> Result<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    Ok(history_today_dir.join(format!(
        "3_sorted_class_records_{}.json",
        get_current_time()
    )))
}

/// $APP_DATA/history/2022-11-25-15-00-00/4_accepted_records.json
pub fn history_accepted_class_path(path_resolver: &PathResolver, uuid: &str) -> Result<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    Ok(history_today_dir.join(format!(
        "4_accepted_class_records_{}.json",
        get_current_time()
    )))
}

/// $APP_DATA/history/2022-11-25-15-00-00/2_accepted_records.csv
pub fn history_accepted_class_csv_path(
    path_resolver: &PathResolver,
    uuid: &str,
) -> Result<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    Ok(history_today_dir.join(format!(
        "4_accepted_class_records_{}.csv",
        get_current_time()
    )))
}

/// $APP_DATA/config/rule.json
pub fn rule_path(path_resolver: &PathResolver) -> Result<PathBuf> {
    let app_data_dir = config_dir(path_resolver)?;
    Ok(app_data_dir.join("rule.json"))
}
