use tauri::api::dialog::message;
use tauri::command;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

/// Close Splashscreen.
/// This command must be async so that it doesn't run on the main thread.
/// [Waiting for Rust](https://tauri.app/v1/guides/features/splashscreen#waiting-for-rust).
#[command]
pub async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

/// Receive csv file path and read csv headers
#[command]
pub fn check_csv_headers(path: &str, window: tauri::Window) -> Result<String, String> {
    let mut rdr = csv::Reader::from_path(path).unwrap();
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
