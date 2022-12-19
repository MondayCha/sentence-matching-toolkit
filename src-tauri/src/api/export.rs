use std::fs::File;
use std::io::Read;
use std::path::PathBuf;

use crate::handler::csv_handler::CsvHandler;
use crate::handler::t2s_handler::Asset;
use crate::utils::classes::SubCategoryCSV;
use crate::utils::errors::AResult;
use crate::utils::records::sub_category::{OutputClass, OutputRecord};

use anyhow::{Context, Result};
use indexmap::IndexMap;
use tauri::command;

use super::rule::AppState;

fn handle_export_sub_category(
    path: &str,
    accepted_sub_categories_path: &PathBuf,
    with_bom: bool,
    sub_categories: &SubCategoryCSV,
) -> Result<String> {
    // serde accepted_sub_categories_path json to outputRecords
    let mut f = File::open(accepted_sub_categories_path)?;
    let mut accepted_sub_category_data = String::new();
    f.read_to_string(&mut accepted_sub_category_data)?;
    let output_records: Vec<OutputRecord> = serde_json::from_str(&accepted_sub_category_data)?;

    let mut sub_categories_map: IndexMap<String, (usize, usize)> = IndexMap::new();
    for sub_category in sub_categories.classes.iter() {
        sub_categories_map.insert(sub_category.name.clone(), (0, sub_category.size));
    }

    for output_record in output_records.iter() {
        if output_record.class.is_empty() {
            continue;
        }
        let (count, _) = sub_categories_map
            .get_mut(&output_record.class)
            .with_context(|| format!("分类 {} 不存在", output_record.class))?;
        *count += 1;
    }

    let mut class_statistic: Vec<OutputClass> = vec![];

    for sub_category in sub_categories_map.iter() {
        class_statistic.push(OutputClass::new(
            sub_category.0,
            sub_category.1 .1,
            sub_category.1 .0,
        ));
    }

    let now = chrono::Local::now();
    let date = now.format("%m-%d");

    // save class_statistic to export_path/MM-DD-各班级明细.csv
    let mut export_class_statistic_path = PathBuf::from(&path);
    export_class_statistic_path.push(format!("{}-各班级明细.csv", date));

    let mut wtr = csv::Writer::from_path(&export_class_statistic_path)?;
    for class in class_statistic {
        wtr.serialize(class)?;
    }
    wtr.flush()?;
    if with_bom {
        CsvHandler::add_utf8_bom(&export_class_statistic_path)?;
    }

    // save output_records to export_path/MM-DD-全校统计.csv
    let mut export_output_records_path = PathBuf::from(&path);
    export_output_records_path.push(format!("{}-全校统计.csv", date));
    let mut wtr = csv::Writer::from_path(&export_output_records_path)?;
    for record in output_records {
        wtr.serialize(record)?;
    }
    wtr.flush()?;
    if with_bom {
        CsvHandler::add_utf8_bom(&export_output_records_path)?;
    }

    Ok(path.to_string())
}

#[command]
pub fn export_sub_category(
    path: &str,
    with_bom: bool,
    state: tauri::State<'_, AppState>,
) -> AResult<String> {
    let accepted_sub_categories_path = &state.path.accepted_sub_categories_path.read().unwrap();
    let rule = &state.rule.read().unwrap();
    let sub_category_csv = &rule
        .sub_category
        .as_ref()
        .with_context(|| "未加载分类信息, 请先加载分类信息, 然后再进行匹配操作")?
        .csv;
    let folder = handle_export_sub_category(
        path,
        accepted_sub_categories_path,
        with_bom,
        sub_category_csv,
    )?;
    Ok(folder)
}

#[command]
pub fn get_vba_snippet() -> AResult<String> {
    let t2s_single_word = Asset::get("color.vb").with_context(|| "Failed to load color.vb")?;
    // convert to string
    let t2s_single_word = std::str::from_utf8(t2s_single_word.data.as_ref())
        .with_context(|| "Failed to convert to string")?;
    Ok(t2s_single_word.to_string())
}
