use indexmap::IndexMap;
use ngrammatic::{Corpus, CorpusBuilder, Pad};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::regex::Regex;

use crate::handler::{
    dict_handler::DictHandler,
    jieba_handler::JiebaHandler,
    regex_handler::{RegexMatchHandler, RegexNumHandler},
};

use super::{
    classes::{IntermediateClassInfo, SubCategoryCSV, SubCategoryRegex, SubCategoryRule},
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

    pub fn get_parsed_company(&self, record: &str) -> Option<ParsedCompany> {
        self.matcher.find_accept(record)
    }

    pub fn remove_category(&self, record: &str) -> String {
        let mut record = record.to_string();
        while let Some((start, end)) = self.matcher.find_accept_range(&record) {
            println!("Removing category: {}", &record[start..end]);
            record.replace_range(start..end, "");
        }
        record
    }

    pub fn get_chinese(&self, text: &str) -> String {
        self.matcher.get_chinese(text)
    }
}

pub enum SubCategoryMatchResult {
    Normal(f32, IntermediateClassInfo),
    Incomplete,
    Suspension,
    Mismatch,
}

pub struct SubCategoryExtracter {
    re_grade: Option<Regex>,
    re_sequence: Option<Regex>,
    re_sequence_num: Option<Regex>,
}

impl SubCategoryExtracter {
    pub fn new(grade: Option<&str>, sequence: Option<&str>, sequence_num: Option<&str>) -> Self {
        Self {
            re_grade: grade.map(|s| Regex::new(s).unwrap()),
            re_sequence: sequence.map(|s| Regex::new(s).unwrap()),
            re_sequence_num: sequence_num.map(|s| Regex::new(s).unwrap()),
        }
    }

    pub fn get_grade(&self, record: &str) -> Option<String> {
        if let Some(re) = &self.re_grade {
            re.captures(record)
                .and_then(|cap| cap.get(0))
                .map(|m| m.as_str().to_string())
        } else {
            None
        }
    }

    pub fn remove_all_grades(&self, record: &str) -> String {
        if let Some(re) = &self.re_grade {
            re.replace_all(record, "").to_string()
        } else {
            record.to_string()
        }
    }

    pub fn get_sequence(&self, record: &str) -> Option<String> {
        if let Some(re) = &self.re_sequence {
            re.captures(record)
                .and_then(|cap| cap.get(0))
                .map(|m| m.as_str().to_string())
        } else {
            None
        }
    }

    pub fn get_sequence_num(&self, record: &str) -> Option<String> {
        if let Some(re) = &self.re_sequence_num {
            println!("Before get_sequence_num: {}", record);
            re.find(record).map(|m| m.as_str().to_string())
        } else {
            None
        }
    }

    pub fn remove_all_sequences(&self, record: &str) -> String {
        if let Some(re) = &self.re_sequence {
            re.replace_all(record, "").to_string()
        } else {
            record.to_string()
        }
    }
}

pub struct SubCategoryMatcher {
    jieba: JiebaHandler,
    sub_category_csv: SubCategoryCSV,
    categories: IndexMap<String, Vec<IntermediateClassInfo>>,
    regex: SubCategoryRegex,
    extracter: SubCategoryExtracter,
    corpus: Corpus,
}

impl SubCategoryMatcher {
    pub fn new(rule: &SubCategoryRule, dict_path: &PathBuf) -> Self {
        let mut categories: IndexMap<String, Vec<IntermediateClassInfo>> = IndexMap::default();
        for c in rule.csv.classes.iter() {
            let id = match c.identity {
                Some(ref id) => id,
                None => &c.name,
            };
            if categories.contains_key(id) {
                categories[id].push(c.clone());
            } else {
                categories.insert(id.to_string(), vec![c.clone()]);
            }
        }
        let regex = rule.regex.clone();
        let mut corpus = CorpusBuilder::new().arity(2).pad_full(Pad::Auto).finish();
        for (i, c) in categories.keys().enumerate() {
            corpus.add_text(c);
        }
        let extracter = SubCategoryExtracter::new(
            regex
                .extract
                .record
                .grade
                .as_ref()
                .map(|s| s.pattern.as_str()),
            regex
                .extract
                .record
                .sequence
                .as_ref()
                .map(|s| s.pattern.as_str()),
            regex
                .extract
                .record
                .sequence_num
                .as_ref()
                .map(|s| s.pattern.as_str()),
        );
        Self {
            jieba: JiebaHandler::new(&dict_path),
            sub_category_csv: rule.csv.clone(),
            categories,
            regex,
            extracter,
            corpus,
        }
    }

    pub fn replace(&self, record: &str) -> String {
        let mut record = record.to_string();
        // replace all str in regex.replace.ignore to empty
        if let Some(ignore_strs) = &self.regex.replace.ignore {
            for s in ignore_strs.iter() {
                record = record.replace(s, "");
            }
        }

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
        record
    }

    pub fn match_sub_category(&self, record: &str) -> SubCategoryMatchResult {
        let option_record_grade = self.extracter.get_grade(record);
        let record_without_grade = self.extracter.remove_all_grades(record);
        let option_record_sequence_num = self.extracter.get_sequence_num(&record_without_grade);
        let record_identity = self.extracter.remove_all_sequences(&record_without_grade);

        println!(
            "Matching sub category: {} {:?} {:?}",
            &record_identity, &option_record_grade, &option_record_sequence_num
        );

        let results = self.corpus.search(&record_identity, 0.01);
        if results.is_empty() {
            if option_record_grade.is_some() || option_record_sequence_num.is_some() {
                return SubCategoryMatchResult::Incomplete;
            }
            return SubCategoryMatchResult::Mismatch;
        }

        let mut i = 0;
        while i < results.len() {
            let search_result = &results[i];
            println!("{} Case sub category: {}", i, &search_result.text);
            let category_list = &self.categories.get(&search_result.text).unwrap();
            let mut j = 0;
            while j < category_list.len() {
                let category = &category_list[j];
                if let Some(record_grade) = &option_record_grade {
                    if self.sub_category_csv.available_grade.contains(record_grade) {
                        if let Some(grade) = &category.grade {
                            if !grade.eq(record_grade) {
                                println!("Grade not match: {} != {}", grade, record_grade);
                                j += 1;
                                continue;
                            }
                        }
                    }
                }
                if let Some(record_sequence_num) = &option_record_sequence_num {
                    if self
                        .sub_category_csv
                        .available_sequence
                        .contains(record_sequence_num)
                    {
                        if let Some(sequence) = &category.sequence {
                            if !sequence.eq(record_sequence_num) {
                                println!(
                                    "Sequence not match: {} != {}",
                                    sequence, record_sequence_num
                                );
                                j += 1;
                                continue;
                            }
                        } else {
                            println!("Sequence not match: None != {}", record_sequence_num);
                            j += 1;
                            continue;
                        }
                    }
                }
                return SubCategoryMatchResult::Normal(
                    search_result.similarity.clone(),
                    category.clone(),
                );
            }
            i += 1;
        }
        SubCategoryMatchResult::Suspension
    }

    // split info into name and subcategory
    pub fn split_name_and_subcategory(&self, info: &str, subcategory: &str) -> (String, String) {
        let info_vec = self.jieba.cut(info);
        println!("info_vec: {:?}", info_vec);
        let mut ans_cadidates = vec![];
        for split_point in 0..info_vec.len() {
            let head_candidate = info_vec[0..split_point].join("");
            let head_sim = strsim::sorensen_dice(&head_candidate, &subcategory);
            let end_candidate = info_vec[split_point..].join("");
            let end_sim = strsim::sorensen_dice(&end_candidate, &subcategory);
            if head_sim > end_sim {
                ans_cadidates.push((head_sim, end_candidate, head_candidate));
            } else {
                ans_cadidates.push((end_sim, head_candidate, end_candidate));
            }
        }
        ans_cadidates.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());
        (ans_cadidates[0].1.clone(), ans_cadidates[0].2.clone())
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
