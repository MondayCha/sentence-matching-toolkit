use indexmap::IndexMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ClassInfo {
    #[serde(rename = "班级")]
    name: String,
    #[serde(rename = "班级人数")]
    size: usize,
}

impl From<IntermediateClassInfo> for ClassInfo {
    fn from(intermediate_class_info: IntermediateClassInfo) -> Self {
        Self {
            name: intermediate_class_info.name,
            size: intermediate_class_info.size,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct IntermediateClassInfo {
    pub name: String,
    pub size: usize,
    pub grade: Option<String>,
    pub identity: Option<String>,
    pub sequence: Option<String>,
}

impl From<ClassInfo> for IntermediateClassInfo {
    fn from(class_info: ClassInfo) -> Self {
        Self {
            name: class_info.name,
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
    pub user: Option<IndexMap<String, String>>,
}

impl SubCategoryReplace {
    pub fn add_user_replace(&mut self, key: String, value: String) {
        if self.user.is_none() {
            self.user = Some(IndexMap::new());
        }
        self.user.as_mut().unwrap().insert(key, value);
    }
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
