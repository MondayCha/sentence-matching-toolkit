use std::{fs::File, io::Write, path::PathBuf};

use crate::utils::{
    matches::{CategoryMatcher, SubCategoryMatcher},
    paths,
    records::{
        base::BaseRecord,
        category::{Category, ModifiedCategory},
        sub_category::{SubCategory, SubCategoryFlag, SubCategoryGroup},
    },
    rules::MatchingRule,
};

use super::{dict_handler::DictHandler, t2s_handler::T2SHandler};

use anyhow::{anyhow, Result};
use rayon::prelude::*;
use tauri::PathResolver;

pub struct SubCategoryHandler();

impl SubCategoryHandler {
    pub fn matching_one(
        base_record: &BaseRecord,
        name: &str,
        company: &str,
        rule: &MatchingRule,
        dict_handler: &DictHandler,
    ) -> Result<SubCategory> {
        // create traditional to simplified handler
        let t2s_handler = T2SHandler::new()?;
        let t2s_convert = |s: &str| t2s_handler.convert(s);

        // create matcher
        let record_matcher = CategoryMatcher::new(rule, &dict_handler.dict_path)?;
        let match_category = |r1: &str, r2: &str| record_matcher.match_category(r1, r2);

        let category = Category::new(
            &BaseRecord {
                name: name.to_string(),
                company: company.to_string(),
                ..base_record.clone()
            },
            &t2s_convert,
            &match_category,
        );
        let modified_category = ModifiedCategory::from(category);

        // init dict and matcher
        let get_name_from_dict = |r: &str| dict_handler.get_name_from_dict(r);
        let sub_category_rule = rule
            .sub_category
            .as_ref()
            .ok_or_else(|| anyhow!("未加载分类信息"))?;
        let sub_category_matcher =
            SubCategoryMatcher::new(sub_category_rule, &dict_handler.dict_path)?;
        let match_sub_category =
            |r: &str| sub_category_matcher.match_sub_category(r, &get_name_from_dict);

        Ok(SubCategory::new(modified_category, &match_sub_category))
    }

    pub fn matching(
        uuid: &str,
        accepted_categories_path: &PathBuf,
        rule: &MatchingRule,
        dict_handler: &DictHandler,
        path_resolver: &PathResolver,
    ) -> Result<(SubCategoryGroup, PathBuf)> {
        if !accepted_categories_path.exists() {
            return Err(anyhow!(
                "文件 {} 不存在",
                accepted_categories_path.to_string_lossy()
            ));
        }

        let accepted_categories_file = File::open(&accepted_categories_path)?;
        let accepted_categories: Vec<ModifiedCategory> =
            serde_json::from_reader(accepted_categories_file)?;

        // init dict and matcher
        let get_name_from_dict = |r: &str| dict_handler.get_name_from_dict(r);
        let sub_category_rule = rule
            .sub_category
            .as_ref()
            .ok_or_else(|| anyhow!("未加载分类信息"))?;
        let sub_category_matcher =
            SubCategoryMatcher::new(sub_category_rule, &dict_handler.dict_path)?;
        let match_sub_category =
            |r: &str| sub_category_matcher.match_sub_category(r, &get_name_from_dict);

        let mut normal_records: Vec<SubCategory> = vec![];
        let mut incomplete_records: Vec<SubCategory> = vec![];
        let mut suspension_records: Vec<SubCategory> = vec![];
        let mut mismatch_records: Vec<SubCategory> = vec![];

        let sub_categories = accepted_categories
            .par_iter()
            .map(|record| SubCategory::new(record.to_owned(), &match_sub_category))
            .collect::<Vec<SubCategory>>();

        for sub_record in sub_categories {
            match sub_record.flag {
                SubCategoryFlag::Normal => {
                    normal_records.push(sub_record);
                }
                SubCategoryFlag::Incomplete => {
                    incomplete_records.push(sub_record);
                }
                SubCategoryFlag::Suspension => {
                    suspension_records.push(sub_record);
                }
                SubCategoryFlag::Mismatch => {
                    mismatch_records.push(sub_record);
                }
            }
        }

        normal_records.sort_by(|a, b| {
            a.matched_class
                .cmp(&b.matched_class)
                .then(a.sub.company.cmp(&b.sub.company))
        });

        let sub_category_record_group = SubCategoryGroup {
            normal_records,
            incomplete_records,
            suspension_records,
            mismatch_records,
        };

        let history_sorted_class_path = paths::history_sorted_class_path(&path_resolver, uuid)?;

        let accepted_records_data = serde_json::to_string(&sub_category_record_group)?;
        let mut f = File::create(&history_sorted_class_path)?;
        f.write_all(accepted_records_data.as_bytes())?;

        Ok((sub_category_record_group, history_sorted_class_path))
    }
}
