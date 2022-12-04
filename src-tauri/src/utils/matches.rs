use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::handler::{
    dict_handler::DictHandler,
    jieba_handler::JiebaHandler,
    regex_handler::{RegexMatchHandler, RegexNumHandler},
};

use super::{
    classes::{IntermediateClassInfo, SubCategoryRegex, SubCategoryRule},
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

pub struct SubCategoryMatcher {
    jieba: JiebaHandler,
    categories: Vec<IntermediateClassInfo>,
    regex: SubCategoryRegex,
}

impl SubCategoryMatcher {
    pub fn new(rule: &SubCategoryRule, dict_path: &PathBuf) -> Self {
        let categories = rule.csv.classes.clone();
        let regex = rule.regex.clone();
        Self {
            jieba: JiebaHandler::new(&dict_path),
            categories,
            regex,
        }
    }

    pub fn replace_and_split(&self, record: &str) -> Vec<String> {
        let mut record = record.to_string();
        // replace all str in regex.replace.before to empty
        if let Some(before_strs) = &self.regex.replace.before {
            for c in before_strs.chars().into_iter() {
                record = record.replace(c, "");
            }
        }
        // replace str in regex.replace.grade
        if let Some(grade_map) = &self.regex.replace.grade {
            for (k, v) in grade_map.iter() {
                record = record.replace(k, v);
            }
        }
        // replace str in regex.replace.identity
        if let Some(identity_map) = &self.regex.replace.identity {
            for (k, v) in identity_map.iter() {
                record = record.replace(k, v);
            }
        }
        // replace str in regex.replace.sequence
        if let Some(sequence_map) = &self.regex.replace.sequence {
            for (k, v) in sequence_map.iter() {
                record = record.replace(k, v);
            }
        }
        // replace all str in regex.replace.after to empty
        if let Some(after_strs) = &self.regex.replace.after {
            for c in after_strs.chars().into_iter() {
                record = record.replace(c, "");
            }
        }
        self.jieba.cut(&record)
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
