use crate::utils::paths;
use tauri::command;
use tauri::AppHandle;

#[command]
pub fn get_sub_category_info(app_handle: AppHandle) -> Result<String, String> {
    // let sub_category_info_path = paths::sub_category_info_path(&app_handle.path_resolver());
    // if let Some(sub_category_info_path) = sub_category_info_path {
    //     if !sub_category_info_path.exists() {
    //         return Err("sub_category_info.json not found".to_string());
    //     }
    // } else {
    //     return Err("sub_category_info.json not found".to_string());
    // }
    Ok("班级信息.csv".to_string())
}
