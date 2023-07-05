use anyhow::{Context, Result};
use indexmap::IndexMap;
use ngrammatic::{Corpus, CorpusBuilder, Pad};
use std::cmp::Ordering::Equal;
use tauri::regex::Regex;

use crate::{
    handler::regex_handler::{RegexMatchHandler, RegexNumHandler},
    utils::classes::{IntermediateClassInfo, SubCategoryCSV, SubCategoryRegex, SubCategoryRule},
    utils::records::category::CategoryResult,
    utils::records::sub_category::{SubCategoryFlag, SubCategoryNameType},
    utils::records::{category::CleanedCategory, sub_category::CleanedSubCategory},
    utils::rules::MatchingRule,
};

pub struct CategoryMatcher {
    // category: String,
    filter: RegexNumHandler,
    matcher: RegexMatchHandler,
    sub_category_matcher: Option<SubCategoryMatcher>,
}

impl CategoryMatcher {
    pub fn new(rule: &MatchingRule) -> Result<Self> {
        Ok(Self {
            // category: rule.rule_name.clone(),
            filter: RegexNumHandler::new()?,
            matcher: RegexMatchHandler::new(rule)?,
            sub_category_matcher: match rule.sub_category {
                Some(ref sub_category) => Some(SubCategoryMatcher::new(sub_category)?),
                None => None,
            },
        })
    }

    pub fn match_category(&self, raw_name: &str, raw_company: &str) -> CategoryResult {
        let split_code = '⌀';
        let filtered_name = raw_name.replace(split_code, "");
        let filtered_company = raw_company.replace(split_code, "");
        let filtered_record = self.filter.replace_all(&format!(
            "{} {} {}",
            filtered_name, split_code, filtered_company
        ));

        if self.matcher.match_accept(&filtered_record) {
            match self.matcher.get_target_and_other(&filtered_record) {
                Some((target, other)) => {
                    let residues = other.split(split_code).collect::<Vec<&str>>();
                    if residues.len() != 2 {
                        // println!("Residue length is not 2: {:?}", residues);
                        return CategoryResult::Improbability;
                    }
                    let cleaned_category = CleanedCategory {
                        company: target.clone(),
                        residue_1: residues[0].to_string(),
                        residue_2: residues[1].to_string(),
                        similarity: 1.0,
                    };
                    if self.matcher.match_reject_in_accept(&target)
                        || self.matcher.match_reject(&filtered_record)
                    {
                        return CategoryResult::Possibility(cleaned_category);
                    } else {
                        return CategoryResult::Certainty(cleaned_category);
                    }
                }
                None => return CategoryResult::Improbability,
            }
        } else {
            if !self.matcher.match_reject(&filtered_record) {
                if let Some(sub_matcher) = self.sub_category_matcher.as_ref() {
                    let sim =
                        sub_matcher.info_contains_sub_category(&filtered_name, &filtered_company);
                    if let Some(matched_sub_category) = sim.1 {
                        return CategoryResult::Probably(CleanedCategory {
                            company: matched_sub_category,
                            residue_1: filtered_name,
                            residue_2: filtered_company,
                            similarity: sim.0,
                        });
                    }
                }
            }
        }
        CategoryResult::Improbability
    }
}

pub struct SubCategoryExtracter {
    re_grade: Option<Regex>,
    re_sequence: Option<Regex>,
    re_sequence_num: Option<Regex>,
    re_chinese: Regex,
}

impl SubCategoryExtracter {
    pub fn new(
        grade: Option<&str>,
        sequence: Option<&str>,
        sequence_num: Option<&str>,
    ) -> Result<Self> {
        let re_grade = if let Some(grade) = grade {
            Some(Regex::new(grade)?)
        } else {
            None
        };

        let re_sequence = if let Some(sequence) = sequence {
            Some(Regex::new(sequence)?)
        } else {
            None
        };

        let re_sequence_num = if let Some(sequence_num) = sequence_num {
            Some(Regex::new(sequence_num)?)
        } else {
            None
        };

        let re_chinese = Regex::new("[\\u4e00-\\u9fa5]*")?;

        Ok(Self {
            re_grade,
            re_sequence,
            re_sequence_num,
            re_chinese,
        })
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

    pub fn get_chinese(&self, text: &str) -> String {
        self.re_chinese
            .find(text)
            .map_or("".to_string(), |m| m.as_str().to_string())
    }
}

pub struct SubCategoryMatcher {
    sub_category_csv: SubCategoryCSV,
    categories: IndexMap<String, Vec<IntermediateClassInfo>>,
    regex: SubCategoryRegex,
    extracter: SubCategoryExtracter,
    corpus: Corpus,
}

impl SubCategoryMatcher {
    pub fn new(rule: &SubCategoryRule) -> Result<Self> {
        let mut categories: IndexMap<String, Vec<IntermediateClassInfo>> = IndexMap::default();
        for c in rule.csv.classes.iter() {
            let id = match c.identity {
                Some(ref id) => id,
                None => &c.name,
            };
            if categories.contains_key(id) {
                categories[id].push(c.clone());
                categories[id].sort();
            } else {
                categories.insert(id.to_string(), vec![c.clone()]);
            }
        }
        let regex = rule.regex.clone();
        let mut corpus = CorpusBuilder::new().arity(2).pad_full(Pad::Auto).finish();
        for (_, c) in categories.keys().enumerate() {
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
        )?;
        Ok(Self {
            sub_category_csv: rule.csv.clone(),
            categories,
            regex,
            extracter,
            corpus,
        })
    }

    fn replace(&self, record: &str) -> String {
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
        // replace str in regex.replace.user
        if let Some(user_map) = &self.regex.replace.user {
            for (k, v) in user_map.iter() {
                record = record.replace(k, v);
            }
        }
        record
    }

    fn contains_sub_category(&self, record: &str) -> (f32, Option<String>) {
        let record = self.replace(&record);
        let option_record_grade = self.extracter.get_grade(&record);
        let record_without_grade = self.extracter.remove_all_grades(&record);
        let option_record_sequence = self.extracter.get_sequence(&record_without_grade);
        let record_identity = self.extracter.remove_all_sequences(&record_without_grade);

        if option_record_grade.is_some() || option_record_sequence.is_some() {
            let results = self.corpus.search(&record_identity, 0.1);
            if !results.is_empty() {
                return (results[0].similarity, Some(results[0].text.to_string()));
            }
        }
        (0.0, None)
    }

    pub fn info_contains_sub_category(&self, name: &str, company: &str) -> (f32, Option<String>) {
        // return max value of self.contains_sub_category(name) and self.contains_sub_category(company)
        let ans_1 = self.contains_sub_category(name);
        let ans_2 = self.contains_sub_category(company);
        if ans_1.0 > ans_2.0 {
            ans_1
        } else {
            ans_2
        }
    }

    pub fn match_sub_category(
        &self,
        record: &str,
        get_name_from_dict: &dyn Fn(&str) -> Option<String>,
    ) -> Result<CleanedSubCategory> {
        let record = self.replace(&record);

        let option_record_grade = self.extracter.get_grade(&record);
        let record_without_grade = self.extracter.remove_all_grades(&record);

        let option_record_sequence_num = self.extracter.get_sequence_num(&record_without_grade);
        let mut record_identity = self.extracter.remove_all_sequences(&record_without_grade);

        // try to get name from dict
        let mut cleaned_sub_category = CleanedSubCategory::default();
        cleaned_sub_category.replaced_info = record.clone();
        if let Some(author) = get_name_from_dict(&record) {
            record_identity = record_identity.replace(&author, "");
            cleaned_sub_category.name = author;
            cleaned_sub_category.name_type = SubCategoryNameType::Dict;
        } else {
            cleaned_sub_category.name = self.extracter.get_chinese(&record);
            cleaned_sub_category.name_type = SubCategoryNameType::Calc;
        };

        let results = self.corpus.search(&record_identity, 0.01);

        if results.is_empty() {
            if option_record_grade.is_some() || option_record_sequence_num.is_some() {
                if matches!(cleaned_sub_category.name_type, SubCategoryNameType::Dict) {
                    cleaned_sub_category.user_input_class =
                        record.replace(&cleaned_sub_category.name, "");
                } else {
                    cleaned_sub_category.user_input_class = record.clone();
                }
                cleaned_sub_category.flag = SubCategoryFlag::Incomplete;
                return Ok(cleaned_sub_category);
            }
            return Ok(cleaned_sub_category);
        }

        let mut i = 0;
        while i < results.len() {
            let search_result = &results[i];
            let category_list = &self.categories.get(&search_result.text).with_context(|| {
                format!(
                    "No category found for sub category: {:?}",
                    &search_result.text
                )
            })?;
            let mut j = 0;
            while j < category_list.len() {
                let category = &category_list[j];
                if let Some(record_grade) = &option_record_grade {
                    if self.sub_category_csv.available_grade.contains(record_grade) {
                        if let Some(grade) = &category.grade {
                            if !grade.eq(record_grade) {
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
                                j += 1;
                                continue;
                            }
                        } else {
                            j += 1;
                            continue;
                        }
                    }
                }

                let (splitted_name, splitted_class) =
                    self.split_name_and_subcategory(&record, &category.name);

                cleaned_sub_category.flag = SubCategoryFlag::Normal;
                cleaned_sub_category.matched_class = category.name.clone();
                cleaned_sub_category.user_input_class = splitted_class;
                cleaned_sub_category.simularity = search_result.similarity;

                let cleaned_splitted_name = self.extracter.get_chinese(&splitted_name);
                if matches!(cleaned_sub_category.name_type, SubCategoryNameType::Calc) {
                    cleaned_sub_category.name = cleaned_splitted_name;
                } else if !cleaned_splitted_name.is_empty()
                    && !cleaned_splitted_name.eq(&cleaned_sub_category.name)
                {
                    println!(
                        "splitted_name: {} | {}",
                        cleaned_splitted_name, cleaned_sub_category.name
                    );
                    cleaned_sub_category.name_calc = cleaned_splitted_name;
                    cleaned_sub_category.name_type = SubCategoryNameType::Doubt;
                }
                return Ok(cleaned_sub_category);
            }
            i += 1;
        }

        if matches!(cleaned_sub_category.name_type, SubCategoryNameType::Dict) {
            cleaned_sub_category.user_input_class = record.replace(&cleaned_sub_category.name, "");
        } else {
            cleaned_sub_category.user_input_class = record;
        }

        cleaned_sub_category.flag = SubCategoryFlag::Suspension;
        Ok(cleaned_sub_category)
    }

    // split info into name and subcategory
    fn split_name_and_subcategory(&self, info: &str, target_category: &str) -> (String, String) {
        // make info into String vector
        let info_vec = info.chars().map(|c| c.to_string()).collect::<Vec<String>>();
        let mut ans_cadidates = vec![];
        for split_point in 0..info_vec.len() {
            let head_candidate = info_vec[0..split_point].join("");
            let head_sim = strsim::sorensen_dice(&head_candidate, &target_category);
            let end_candidate = info_vec[split_point..].join("");
            let end_sim = strsim::sorensen_dice(&end_candidate, &target_category);
            if head_sim > end_sim {
                ans_cadidates.push((head_sim, end_candidate, head_candidate));
            } else {
                ans_cadidates.push((end_sim, head_candidate, end_candidate));
            }
        }
        ans_cadidates.sort_by(|a, b| {
            b.0.partial_cmp(&a.0)
                .unwrap_or(Equal)
                .then(b.2.len().cmp(&a.2.len()))
        });
        (ans_cadidates[0].1.clone(), ans_cadidates[0].2.clone())
    }
}
