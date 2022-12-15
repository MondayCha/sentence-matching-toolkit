use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::{collections::HashSet, fs::File, io::Write, path::PathBuf};
use tauri::{regex::Regex, PathResolver};

use super::{
    classes::{SubCategoryCSV, SubCategoryRegex, SubCategoryRule},
    paths,
};

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
    pub fn new(path: Option<&str>, path_resolver: &PathResolver) -> Result<Self> {
        let rule_path = paths::rule_path(&path_resolver)?;

        let default_rule = MatchingRule {
            rule_path: rule_path.clone(),
            ..Default::default()
        };

        // if path is None, use default rule
        let import_path = match path {
            Some(path) => PathBuf::from(path),
            None => rule_path.clone(),
        };
        if !import_path.exists() {
            // if import file not exists, create a default rule file
            default_rule.save()?;
            return Ok(default_rule);
        }

        let rule_json_file = File::open(&import_path)?;
        let mut rule: Self = serde_json::from_reader(rule_json_file)?;
        rule.rule_path = rule_path;
        rule.label()?;
        rule.save()?;
        return Ok(rule);
    }

    fn save(&self) -> Result<()> {
        let rule_data = serde_json::to_string_pretty(self)?;
        let mut f = File::create(&self.rule_path)?;
        f.write_all(rule_data.as_bytes())?;
        Ok(())
    }

    fn label(&mut self) -> Result<()> {
        if let Some(sub_category) = &mut self.sub_category {
            let csv = &mut sub_category.csv;
            // init regex pattern
            if let Some(extract_grade) = sub_category.regex.extract.csv.grade.clone() {
                let mut grade_set = HashSet::new();
                let re_grade = Regex::new(&extract_grade.pattern)?;
                for c in &mut csv.classes {
                    for cap in re_grade.captures_iter(&c.name) {
                        if let Some(g) =
                            cap.get(extract_grade.index).map(|m| m.as_str().to_string())
                        {
                            grade_set.insert(g.clone());
                            c.grade = Some(g);
                        }
                        break;
                    }
                }
                csv.available_grade = grade_set.into_iter().collect();
            }

            // https://docs.rs/regex/latest/regex/#example-iterating-over-capture-groups
            if let Some(extract_identity) = sub_category.regex.extract.csv.identity.clone() {
                println!("extract_identity: {:?}", extract_identity);
                let re_identity = Regex::new(&extract_identity.pattern)?;
                for c in &mut csv.classes {
                    for cap in re_identity.captures_iter(&c.name) {
                        c.identity = cap
                            .get(extract_identity.index)
                            .map(|m| m.as_str().to_string());
                        break;
                    }
                }
            }

            if let Some(extract_sequence) = sub_category.regex.extract.csv.sequence.clone() {
                let mut sequence_set = HashSet::new();
                let re_sequence = Regex::new(&extract_sequence.pattern)?;
                for c in &mut csv.classes {
                    for cap in re_sequence.captures_iter(&c.name) {
                        if let Some(s) = cap
                            .get(extract_sequence.index)
                            .map(|m| m.as_str().to_string())
                        {
                            sequence_set.insert(s.clone());
                            c.sequence = Some(s);
                        }
                        break;
                    }
                }
                csv.available_sequence = sequence_set.into_iter().collect();
            }
        }
        Ok(())
    }

    pub fn update_sub_category_csv(&mut self, csv: SubCategoryCSV) -> Result<()> {
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
