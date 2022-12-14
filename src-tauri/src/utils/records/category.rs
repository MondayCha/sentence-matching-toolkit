use super::base::BaseRecord;
use serde::{Deserialize, Serialize};

/// Cleaned category info.
#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct CleanedCategory {
    pub company: String,
    pub residue_1: String,
    pub residue_2: String,
}

/// Category result show the possibility of match to a category.
///
/// See [Structs and enums in JSON](https://serde.rs/json.html)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CategoryResult {
    Certainty(CleanedCategory),
    Probably(CleanedCategory),
    Possibility(CleanedCategory),
    Improbability,
}

impl Default for CategoryResult {
    fn default() -> Self {
        CategoryResult::Improbability
    }
}

/// Category flag is used to mark the category result.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CategoryFlag {
    Certainty,
    Probably,
    Possibility,
    Improbability,
}

impl Default for CategoryFlag {
    fn default() -> Self {
        CategoryFlag::Improbability
    }
}

/// Category is a unit of output data for stage 1.
#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub raw: BaseRecord,
    pub now: BaseRecord,
    // if the record is matched to a category, the result will be stored here.
    pub cleaned: Option<CleanedCategory>,
    pub flag: CategoryFlag,
}

impl Category {
    pub fn new(
        record: &BaseRecord,
        t2s_convert: &dyn Fn(&str) -> String,
        match_category: &dyn Fn(&str, &str) -> CategoryResult,
    ) -> Self {
        let simplified_name = t2s_convert(&record.name);
        let simplified_company = t2s_convert(&record.company);
        let (cleaned, flag) = match match_category(&simplified_name, &simplified_company) {
            CategoryResult::Certainty(c) => (Some(c), CategoryFlag::Certainty),
            CategoryResult::Probably(c) => (Some(c), CategoryFlag::Probably),
            CategoryResult::Possibility(c) => (Some(c), CategoryFlag::Possibility),
            CategoryResult::Improbability => (None, CategoryFlag::Improbability),
        };
        Category {
            cleaned,
            flag,
            now: BaseRecord {
                index: record.index.clone(),
                timestamp: record.timestamp.clone(),
                location: record.location.clone(),
                name: simplified_name,
                company: simplified_company,
            },
            raw: record.clone(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CategoryGroup {
    #[serde(rename = "certaintyRecords")]
    pub certainty_records: Vec<Category>,
    #[serde(rename = "probablyRecords")]
    pub probably_records: Vec<Category>,
    #[serde(rename = "possibilityRecords")]
    pub possibility_records: Vec<Category>,
    #[serde(rename = "improbabilityRecords")]
    pub improbability_records: Vec<Category>,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct ModifiedCategory {
    pub raw: BaseRecord, // original
    pub old: BaseRecord, // category
    pub new: BaseRecord, // modified
    // if the record is matched to a category, the result will be stored here.
    pub cleaned: Option<CleanedCategory>,
    pub flag: CategoryFlag,
}
