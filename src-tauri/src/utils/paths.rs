use std::path::PathBuf;
use tauri::PathResolver;

/// $APP_CACHE/cache
pub fn cache_dir(path_resolver: &PathResolver) -> Option<PathBuf> {
    let app_cache_dir_option = path_resolver.app_cache_dir();
    if let Some(app_cache_dir) = app_cache_dir_option {
        let dict_dir = app_cache_dir.join("cache");
        Some(dict_dir)
    } else {
        None
    }
}

/// $APP_DATA/history
pub fn history_dir(path_resolver: &PathResolver) -> Option<PathBuf> {
    let app_data_dir_option = path_resolver.app_data_dir();
    if let Some(app_data_dir) = app_data_dir_option {
        let history_dir = app_data_dir.join("history");
        Some(history_dir)
    } else {
        None
    }
}

/// $APP_DATA/history/2022-11-25-15-00-00
pub fn history_uuid_dir(path_resolver: &PathResolver, uuid: &str) -> Option<PathBuf> {
    let history_dir = history_dir(path_resolver)?;
    Some(history_dir.join(uuid))
}

///////////////////////////////////////////////////////////////////////////////////////

/// $APP_CACHE/cache/dict.txt
pub fn dictionary_path(path_resolver: &PathResolver) -> Option<PathBuf> {
    let dict_dir = cache_dir(path_resolver)?;
    Some(dict_dir.join("dict.txt"))
}

/// $APP_CACHE/cache/relations.json
pub fn relations_path(path_resolver: &PathResolver) -> Option<PathBuf> {
    let dict_dir = cache_dir(path_resolver)?;
    Some(dict_dir.join("relations.json"))
}

/// $APP_DATA/history/2022-11-25-15-00-00/1_sorted_records.json
pub fn history_sorted_path(path_resolver: &PathResolver, uuid: &str) -> Option<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    let current = chrono::Local::now().format("%H_%M_%S").to_string();
    Some(history_today_dir.join(format!("1_sorted_records_{}.json", current)))
}

/// $APP_DATA/history/2022-11-25-15-00-00/2_accepted_records.json
pub fn history_accepted_path(path_resolver: &PathResolver, uuid: &str) -> Option<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    let current = chrono::Local::now().format("%H_%M_%S").to_string();
    Some(history_today_dir.join(format!("2_accepted_records_{}.json", current)))
}

/// $APP_DATA/history/2022-11-25-15-00-00/2_accepted_records.csv
pub fn history_accepted_csv_path(path_resolver: &PathResolver, uuid: &str) -> Option<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    let current = chrono::Local::now().format("%H_%M_%S").to_string();
    Some(history_today_dir.join(format!("2_accepted_records_{}.csv", current)))
}

/// $APP_DATA/history/2022-11-25-15-00-00/3_sorted_records.json
pub fn history_sorted_class_path(path_resolver: &PathResolver, uuid: &str) -> Option<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    let current = chrono::Local::now().format("%H_%M_%S").to_string();
    Some(history_today_dir.join(format!("3_sorted_class_records_{}.json", current)))
}

/// $APP_DATA/history/2022-11-25-15-00-00/4_accepted_records.json
pub fn history_accepted_class_path(path_resolver: &PathResolver, uuid: &str) -> Option<PathBuf> {
    let history_today_dir = history_uuid_dir(path_resolver, uuid)?;
    let current = chrono::Local::now().format("%H_%M_%S").to_string();
    Some(history_today_dir.join(format!("4_accepted_class_records_{}.json", current)))
}

/// $APP_DATA/rule.json
pub fn rule_path(path_resolver: &PathResolver) -> Option<PathBuf> {
    let app_data_dir = path_resolver.app_data_dir()?;
    Some(app_data_dir.join("rule.json"))
}

/// $APP_DATA/rule_template.json
pub fn rule_template_path(path_resolver: &PathResolver) -> Option<PathBuf> {
    let app_data_dir = path_resolver.app_data_dir()?;
    Some(app_data_dir.join("rule_template.json"))
}
