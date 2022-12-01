use super::paths;
use serde::{Deserialize, Serialize};
use std::io::Result;
use std::{fs::File, io::Write, path::PathBuf};
use tauri::PathResolver;

#[derive(Debug, Serialize, Deserialize)]
pub struct ClassInfo {
    #[serde(rename = "班级")]
    name: String,
    #[serde(rename = "班级人数")]
    size: i32,
}

impl ClassInfo {
    pub fn from(intermediate_class_info: &IntermediateClassInfo) -> Self {
        Self {
            name: intermediate_class_info.name.clone(),
            size: intermediate_class_info.size,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IntermediateClassInfo {
    pub name: String,
    pub size: i32,
    pub times: i32,
}

impl IntermediateClassInfo {
    pub fn from(class_info: &ClassInfo) -> Self {
        Self {
            name: class_info.name.clone(),
            size: class_info.size,
            times: 0,
        }
    }
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct SubCategoryRule {
    #[serde(skip)]
    pub path: PathBuf,
    pub name: String,
    pub version: String,
    pub classes: Vec<IntermediateClassInfo>,
}

impl SubCategoryRule {
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
            let rule_path = paths::sub_category_rule_path(&path_resolver).unwrap_or_default();
            rule.path = rule_path;
            rule.save().unwrap();
            return Some(rule);
        };
    }

    pub fn save(&self) -> Result<()> {
        let rule_data = serde_json::to_string_pretty(self).unwrap();
        let mut f = File::create(&self.path)?;
        f.write_all(rule_data.as_bytes())?;
        Ok(())
    }
}
