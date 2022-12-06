use super::paths;
use indexmap::IndexMap;
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IntermediateClassInfo {
    pub name: String,
    pub size: i32,
    pub grade: Option<String>,
    pub identity: Option<String>,
    pub sequence: Option<String>,
}

impl IntermediateClassInfo {
    pub fn from(class_info: &ClassInfo) -> Self {
        Self {
            name: class_info.name.clone(),
            size: class_info.size,
            grade: None,
            identity: None,
            sequence: None,
        }
    }
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategoryPattern {
    pub pattern: String,
    pub index: usize,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategoryCsvLabel {
    pub grade: Option<SubCategoryPattern>,
    pub identity: Option<SubCategoryPattern>,
    pub sequence: Option<SubCategoryPattern>,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategoryRecordLabel {
    pub grade: Option<SubCategoryPattern>,
    pub sequence: Option<SubCategoryPattern>,
    pub sequence_num: Option<SubCategoryPattern>,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategoryExtract {
    pub csv: SubCategoryCsvLabel,
    pub record: SubCategoryRecordLabel,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategoryReplace {
    pub ignore: Option<Vec<String>>,
    pub before: Option<String>,
    pub grade: Option<IndexMap<String, String>>,
    pub identity: Option<IndexMap<String, String>>,
    pub sequence: Option<IndexMap<String, String>>,
    pub after: Option<String>,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategoryRegex {
    pub replace: SubCategoryReplace,
    pub extract: SubCategoryExtract,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategoryCSV {
    pub name: String,
    pub available_grade: Vec<String>,
    pub available_sequence: Vec<String>,
    pub classes: Vec<IntermediateClassInfo>,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategoryRule {
    pub regex: SubCategoryRegex,
    pub csv: SubCategoryCSV,
}
