use std::collections::HashMap;
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::{cmp::Ordering::Equal, io::Write};

use anyhow::{anyhow, Context, Result};
use rayon::prelude::*;
use tauri::PathResolver;

use crate::utils::records::category::{CategoryResult, ModifiedCategory};
use crate::utils::{
    matches::CategoryMatcher,
    paths,
    records::{
        base::{BaseRecord, SourceRecord},
        category::{Category, CategoryFlag, CategoryGroup},
    },
    rules::MatchingRule,
};

use super::csv_handler::CsvHandler;
use super::{dict_handler::DictHandler, t2s_handler::T2SHandler};

pub struct CategoryHandler();

impl CategoryHandler {
    /// `matching` 将 csv 文件中的记录根据 `MatchingRule` 中的规则进行匹配，\
    /// 并将匹配结果写入到 `APP_DATA/history/uuid` 目录下的文件中。
    ///
    /// return a `CategoryGroup` and a `PathBuf` of serialized `CategoryGroup`.
    pub fn matching(
        uuid: &str,
        csv_path: &str,
        rule: &MatchingRule,
        dict_handler: &DictHandler,
        path_resolver: &PathResolver,
    ) -> Result<(CategoryGroup, PathBuf)> {
        // create folder in APP_DATA/history/uuid (history_uuid_dir)
        let uuid_dir = paths::history_uuid_dir(&path_resolver, uuid)?;
        if !uuid_dir.exists() {
            std::fs::create_dir_all(&uuid_dir)?;
        }

        let path = Path::new(csv_path);

        // check if file exists
        if !path.exists() {
            return Err(anyhow!("路径 {} 不存在！", csv_path));
        }

        // create traditional to simplified handler
        let t2s_handler = T2SHandler::new()?;
        let t2s_convert = |s: &str| t2s_handler.convert(s);

        // create matcher
        let record_matcher = CategoryMatcher::new(rule, &dict_handler.dict_path)?;
        let match_category = |r1: &str, r2: &str| record_matcher.match_category(r1, r2);

        // read csv file
        let mut rdr = csv::Reader::from_path(path)?;

        let mut certainty_records = Vec::new();
        let mut probably_records = Vec::new();
        let mut possibility_records = Vec::new();
        let mut improbability_records = Vec::new();

        let mut base_records = Vec::new();

        for result in rdr.deserialize() {
            let source_record: SourceRecord =
                result.map_err(|e| anyhow!("读取 CSV 行失败：{}", e.to_string()))?;
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
            if let Some(a_cleaned) = a.cleaned.as_ref() {
                if let Some(b_cleaned) = b.cleaned.as_ref() {
                    return b_cleaned
                        .similarity
                        .partial_cmp(&a_cleaned.similarity)
                        .unwrap_or(Equal)
                        .then(a.raw.company.cmp(&b.raw.company));
                }
            }
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

        let category_group = CategoryGroup {
            certainty_records,
            probably_records,
            possibility_records,
            improbability_records,
        };

        let record_group_path = paths::history_sorted_path(&path_resolver, uuid)?;
        let record_group_data = serde_json::to_string(&category_group)?;
        let mut f = File::create(&record_group_path)?;
        f.write_all(record_group_data.as_bytes())?;

        Ok((category_group, record_group_path))
    }

    /// `receiving` 从 `APP_DATA/history/uuid` 目录下的文件中读取原始数据，\
    /// 并和前端传来的数据进行整合，\
    /// 将整合后的数据写入 `APP_DATA/history/uuid` 目录下的文件中。
    pub fn receiving(
        uuid: &str,
        categories_path: &PathBuf,
        records: Vec<BaseRecord>,
        with_bom: bool,
        rule: &MatchingRule,
        dict_handler: &DictHandler,
        path_resolver: &PathResolver,
    ) -> Result<PathBuf> {
        // create matcher
        let record_matcher = CategoryMatcher::new(rule, &dict_handler.dict_path)?;
        let match_category = |r1: &str, r2: &str| record_matcher.match_category(r1, r2);

        // load records map indexed by index from record_group_path
        let mut records_map = HashMap::new();
        let mut f = File::open(categories_path)?;
        let mut record_group_data = String::new();
        f.read_to_string(&mut record_group_data)?;
        let category_group: CategoryGroup = serde_json::from_str(&record_group_data)?;

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
            if !records_map.contains_key(&record.index) {
                continue;
            }
            let category = records_map
                .get(&record.index)
                .with_context(|| "无法读取历史记录，保存失败")?
                .clone();

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
                            CategoryResult::Probably(cleaned) => Some(cleaned),
                            CategoryResult::Possibility(cleaned) => Some(cleaned),
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

        modified_records.sort_by(|a, b| a.raw.index.cmp(&b.raw.index));

        // save modified_records to accepted_records_path in json format
        let accepted_records_path = paths::history_accepted_path(&path_resolver, uuid)?;
        let data = serde_json::to_string(&modified_records)?;
        let mut f = File::create(&accepted_records_path)?;
        f.write_all(data.as_bytes())?;

        // save the "new" in modified_records to accepted_records_csv_path in csv format
        let accepted_records_csv_path = paths::history_accepted_csv_path(&path_resolver, uuid)?;

        let mut wtr = csv::Writer::from_path(&accepted_records_csv_path)?;
        for record in records {
            let sr = SourceRecord::from(record);
            wtr.serialize(sr)?;
        }

        // if params.with_bom is true, reopen csv file, add BOM to the head
        if with_bom {
            CsvHandler::add_utf8_bom(&accepted_records_csv_path)?;
        }

        Ok(accepted_records_path)
    }
}
