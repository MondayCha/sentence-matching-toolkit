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

/// $APP_DATA/history/2022-11-25
pub fn history_today_dir(path_resolver: &PathResolver) -> Option<PathBuf> {
    let history_dir = history_dir(path_resolver)?;
    let date = chrono::Local::now().format("%Y-%m-%d").to_string();
    Some(history_dir.join(date))
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

/// $APP_DATA/history/2022-11-25/2022-11-25-15-00-00.json
pub fn history_current_path(path_resolver: &PathResolver) -> Option<PathBuf> {
    let history_today_dir = history_today_dir(path_resolver)?;
    let time = chrono::Local::now().format("%Y-%m-%d-%H-%M-%S").to_string();
    Some(history_today_dir.join(format!("{}.json", time)))
}

/// $APP_DATA/dict_handler.json
pub fn dict_handler_path(path_resolver: &PathResolver) -> Option<PathBuf> {
    let app_data_dir = path_resolver.app_data_dir()?;
    Some(app_data_dir.join("dict_handler.json"))
}
