use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::handler::{
    dict_handler::DictHandler,
    jieba_handler::JiebaHandler,
    regex_handler::{RegexMatchHandler, RegexNumHandler},
};

use super::{
    classes::SubCategoryRule,
    records::{ParsedCompany, RecordMatchingResult},
    rules::MatchingRule,
};

pub struct RecordMatcher {
    filter: RegexNumHandler,
    matcher: RegexMatchHandler,
}

impl RecordMatcher {
    pub fn new(rule: &MatchingRule) -> Self {
        Self {
            filter: RegexNumHandler::new(),
            matcher: RegexMatchHandler::new(rule),
        }
    }

    pub fn match_category(
        &self,
        record: &str,
        dict_handler: &DictHandler,
    ) -> (RecordMatchingResult, ParsedCompany) {
        let record = self.filter.replace_all(record);

        if self.matcher.match_accept(&record) {
            match self.matcher.find_accept(&record) {
                Some(category_info) => {
                    println!("Matched category: {}", category_info.name);
                    if self.matcher.match_reject(&category_info.name)
                        || self.matcher.match_reject_city(&record)
                    {
                        (RecordMatchingResult::Possibility, category_info)
                    } else {
                        (RecordMatchingResult::Certainty, category_info)
                    }
                }
                None => (
                    RecordMatchingResult::Improbability,
                    ParsedCompany::default(),
                ),
            }
        } else {
            if dict_handler.can_match_key(&record) {
                (RecordMatchingResult::Probably, ParsedCompany::default())
            } else {
                (
                    RecordMatchingResult::Improbability,
                    ParsedCompany::default(),
                )
            }
        }
    }

    pub fn remove_category(&self, record: &str) -> String {
        let mut record = record.to_string();
        while let Some((start, end)) = self.matcher.find_accept_range(&record) {
            println!("Removing category: {}", &record[start..end]);
            record.replace_range(start..end, "");
        }
        record
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubCategoryInfo {
    pub name: String,
    pub size: i32,
    pub times: i32,
    pub grade: Option<String>,
    pub identity: Option<String>,
    pub sequence: Option<String>,
}

pub struct SubCategoryMatcher {
    jieba: JiebaHandler,
    categories: Vec<SubCategoryInfo>,
}

impl SubCategoryMatcher {
    pub fn new(rule: &SubCategoryRule, dict_path: &PathBuf) -> Self {
        let mut categories = vec![];
        for c in &rule.csv.classes {
            categories.push(SubCategoryInfo {
                name: c.name.clone(),
                size: c.size.clone(),
                times: 0,
                grade: None,
                identity: None,
                sequence: None,
            });
        }
        Self {
            jieba: JiebaHandler::new(&dict_path),
            categories,
        }
    }
}

// create jieba handler
// let dict_path = paths::dictionary_path(&app_handle.path_resolver()).unwrap_or_default();
// let jieba_handler = if enable_dict && dict_path.exists() {
//     JiebaHandler::new(Some(&dict_path))
// } else {
//     JiebaHandler::new(None)
// };
// let jieba_cut = |s: &str| jieba_handler.cut(s);
