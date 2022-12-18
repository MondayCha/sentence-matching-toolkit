use std::cmp::Ordering;

use super::{base::BaseRecord, category::ModifiedCategory};
use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
pub enum SubCategoryNameType {
    Calc,
    Dict,
}

impl Default for SubCategoryNameType {
    fn default() -> Self {
        SubCategoryNameType::Calc
    }
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct CleanedSubCategory {
    pub flag: SubCategoryFlag,
    pub replaced_info: String,
    pub name_type: SubCategoryNameType,
    pub name: String,
    pub matched_class: String,
    pub user_input_class: String,
    pub simularity: f32,
}

/// Sub-category flag is used to mark the category result.
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
pub enum SubCategoryFlag {
    Normal,
    Incomplete,
    Suspension,
    Mismatch,
}

impl Default for SubCategoryFlag {
    fn default() -> Self {
        SubCategoryFlag::Mismatch
    }
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct SubCategory {
    pub raw: BaseRecord, // original
    pub cat: BaseRecord, // category
    pub sub: BaseRecord, // sub-category
    #[serde(rename = "matchedClass")]
    pub matched_class: Option<String>,
    pub simularity: f32,
    pub flag: SubCategoryFlag,
}

impl SubCategory {
    pub fn new(
        modified_category: ModifiedCategory,
        match_sub_category: &dyn Fn(&str) -> Result<CleanedSubCategory>,
    ) -> Self {
        let default = SubCategory {
            raw: modified_category.raw.clone(),
            cat: modified_category.new.clone(),
            ..Default::default()
        };

        if let Some(cleaned_category) = modified_category.cleaned {
            let result_1 = match match_sub_category(&cleaned_category.residue_1) {
                Ok(result) => result,
                Err(_) => return default,
            };
            let result_2 = match match_sub_category(&cleaned_category.residue_2) {
                Ok(result) => result,
                Err(_) => return default,
            };

            let mut sub_name = "".to_string();
            let mut sub_company = modified_category.new.company.clone();
            let mut sub_flag = SubCategoryFlag::Mismatch;
            let mut matched_class: Option<String> = None;
            let mut simularity = 0.0;

            if result_2.name_type == SubCategoryNameType::Dict {
                sub_name = result_2.name;
            } else if !result_1.name.is_empty() {
                sub_name = result_1.name;
            }

            if result_1.flag == SubCategoryFlag::Normal {
                sub_flag = SubCategoryFlag::Normal;
                sub_company = result_1.user_input_class;
                matched_class = Some(result_1.matched_class);
                simularity = result_1.simularity;
            } else if result_2.flag == SubCategoryFlag::Normal {
                sub_flag = SubCategoryFlag::Normal;
                sub_company = result_2.user_input_class;
                matched_class = Some(result_2.matched_class);
                simularity = result_2.simularity;
            } else if result_1.flag == SubCategoryFlag::Suspension {
                sub_flag = SubCategoryFlag::Suspension;
                sub_company = result_1.user_input_class;
            } else if result_2.flag == SubCategoryFlag::Suspension {
                sub_flag = SubCategoryFlag::Suspension;
                sub_company = result_2.user_input_class;
            } else if result_1.flag == SubCategoryFlag::Incomplete {
                sub_flag = SubCategoryFlag::Incomplete;
                sub_company = result_1.user_input_class;
            } else if result_2.flag == SubCategoryFlag::Incomplete {
                sub_flag = SubCategoryFlag::Incomplete;
                sub_company = result_2.user_input_class;
            } else if result_1.flag == SubCategoryFlag::Mismatch
                || result_2.flag == SubCategoryFlag::Mismatch
            {
                sub_flag = SubCategoryFlag::Mismatch;
            }

            return SubCategory {
                matched_class,
                simularity,
                flag: sub_flag,
                raw: modified_category.raw.clone(),
                sub: BaseRecord {
                    name: sub_name,
                    company: sub_company,
                    ..modified_category.raw
                },
                cat: modified_category.new,
            };
        }
        default
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubCategoryGroup {
    #[serde(rename = "normalRecords")]
    pub normal_records: Vec<SubCategory>,
    #[serde(rename = "incompleteRecords")]
    pub incomplete_records: Vec<SubCategory>,
    #[serde(rename = "suspensionRecords")]
    pub suspension_records: Vec<SubCategory>,
    #[serde(rename = "mismatchRecords")]
    pub mismatch_records: Vec<SubCategory>,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ModifiedSubCategory {
    pub index: i32,
    pub name: String,
    #[serde(rename = "matchedClass")]
    pub matched_class: String,
}

impl PartialOrd for ModifiedSubCategory {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for ModifiedSubCategory {
    fn cmp(&self, other: &Self) -> Ordering {
        if self.matched_class.is_empty() {
            return Ordering::Greater;
        } else if other.matched_class.is_empty() {
            return Ordering::Less;
        }
        self.matched_class.cmp(&other.matched_class)
    }
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct OutputRecord {
    #[serde(rename = "序号")]
    pub index: usize,
    #[serde(rename = "姓名")]
    pub name: String,
    #[serde(rename = "提交时间")]
    pub timestamp: String,
    #[serde(rename = "单位")]
    pub company: String,
    #[serde(rename = "班级")]
    pub class: String,
    #[serde(rename = "原始数据")]
    pub info: String,
}

impl OutputRecord {
    pub fn new(
        index: usize,
        company: &str,
        sub_category: &SubCategory,
        modified_sub_category: &ModifiedSubCategory,
    ) -> Self {
        OutputRecord {
            index,
            name: modified_sub_category.name.clone(),
            timestamp: sub_category.raw.timestamp.clone(),
            company: company.to_string(),
            class: modified_sub_category.matched_class.clone(),
            info: format!("{} {}", sub_category.raw.name, sub_category.raw.company),
        }
    }
}
