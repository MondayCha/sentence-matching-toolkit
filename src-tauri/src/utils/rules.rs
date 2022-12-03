use crate::utils::{classes::SubCategoryRule, paths};
use serde::{Deserialize, Serialize};
use std::{
    fs::File,
    io::{Result, Write},
    path::PathBuf,
};
use tauri::{regex::Regex, PathResolver};

use super::classes::{SubCategoryCSV, SubCategoryRegex};

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct CategoryRule {
    pub accept_pattern: String,
    pub accept_filter_pattern: String,
    pub reject_pattern: String,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct MatchingRule {
    #[serde(skip)]
    pub rule_path: PathBuf,
    pub rule_name: String,
    pub rule_version: String,
    // category matching rules
    pub category: CategoryRule,
    pub sub_category: Option<SubCategoryRule>,
}

impl MatchingRule {
    pub fn from(json_path: &PathBuf, path_resolver: &PathResolver) -> Option<Self> {
        if !json_path.exists() {
            return None;
        } else {
            let rule_json_file = match File::open(&json_path) {
                Ok(file) => file,
                Err(_) => {
                    return None;
                }
            };
            let mut rule: Self = match serde_json::from_reader(rule_json_file) {
                Ok(rule) => rule,
                Err(err) => {
                    println!("rule: {:?}", err);
                    return None;
                }
            };
            let rule_path = paths::rule_path(&path_resolver).unwrap_or_default();
            rule.rule_path = rule_path;
            rule.label().unwrap();
            rule.save().unwrap();
            return Some(rule);
        };
    }

    fn save(&self) -> Result<()> {
        let rule_data = serde_json::to_string_pretty(self).unwrap();
        let mut f = File::create(&self.rule_path)?;
        f.write_all(rule_data.as_bytes())?;
        Ok(())
    }

    fn label(&mut self) -> Result<()> {
        if let Some(sub_category) = &mut self.sub_category {
            let csv = &mut sub_category.csv;
            // init regex pattern
            if let Some(extract_grade) = sub_category.regex.extract.grade.clone() {
                let re_grade = Regex::new(&extract_grade).unwrap();
                for c in &mut csv.classes {
                    for cap in re_grade.captures_iter(&c.name) {
                        c.grade = cap.get(1).map(|m| m.as_str().to_string());
                        break;
                    }
                }
            }

            // https://docs.rs/regex/latest/regex/#example-iterating-over-capture-groups
            if let Some(extract_identity) = sub_category.regex.extract.identity.clone() {
                println!("extract_identity: {:?}", extract_identity);
                let re_identity = Regex::new(&extract_identity).unwrap();
                for c in &mut csv.classes {
                    for cap in re_identity.captures_iter(&c.name) {
                        c.identity = cap.get(1).map(|m| m.as_str().to_string());
                        break;
                    }
                }
            }

            if let Some(extract_sequence) = sub_category.regex.extract.sequence.clone() {
                let re_sequence = Regex::new(&extract_sequence).unwrap();
                for c in &mut csv.classes {
                    for cap in re_sequence.captures_iter(&c.name) {
                        c.sequence = cap.get(1).map(|m| m.as_str().to_string());
                        break;
                    }
                }
            }
        }
        Ok(())
    }

    pub fn generate_template(path_resolver: &PathResolver) -> Result<()> {
        let mut rule = MatchingRule::default();
        rule.rule_path = paths::rule_template_path(&path_resolver).unwrap_or_default();
        rule.save()
    }

    pub fn update_sub_category_csv(&mut self, mut csv: SubCategoryCSV) -> Result<()> {
        if let Some(sub_category) = &mut self.sub_category {
            // init regex pattern
            sub_category.csv = csv;
        } else {
            self.sub_category = Some(SubCategoryRule {
                regex: SubCategoryRegex::default(),
                csv,
            })
        }
        self.label()?;
        self.save()?;
        Ok(())
    }
}