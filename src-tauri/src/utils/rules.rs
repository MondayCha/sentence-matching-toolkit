use crate::utils::paths;
use serde::{Deserialize, Serialize};
use std::{
    fs::File,
    io::{Result, Write},
    path::PathBuf,
};
use tauri::PathResolver;

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct MatchingRule {
    #[serde(skip)]
    pub rule_path: PathBuf,
    pub rule_name: String,
    pub rule_version: String,
    // category matching rules
    pub accept_pattern: String,
    pub accept_filter_pattern: String,
    pub reject_pattern: String,
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

    pub fn generate_template(path_resolver: &PathResolver) -> Result<()> {
        let mut rule = MatchingRule::default();
        rule.rule_path = paths::rule_template_path(&path_resolver).unwrap_or_default();
        rule.save()
    }
}
