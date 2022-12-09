use serde::{Deserialize, Serialize};

use super::classes::IntermediateClassInfo;

#[derive(Debug, Serialize, Deserialize)]
pub struct SourceRecord {
    #[serde(rename = "序号")]
    index: i32,
    #[serde(rename = "提交时间")]
    timestamp: String,
    #[serde(rename = "请选择单位所在地")]
    location: String,
    #[serde(rename = "姓名")]
    name: String,
    #[serde(rename = "单位")]
    company: String,
}

impl SourceRecord {
    pub fn from(record: IntermediateRecord) -> Self {
        SourceRecord {
            index: record.index,
            timestamp: record.timestamp,
            location: record.location,
            name: record.name,
            company: record.company,
        }
    }
}
#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct ParsedCompany {
    pub all: String,
    pub name: String,
    pub start: usize,
    pub end: usize,
}

impl ParsedCompany {
    pub fn new(record: &str, company: &str, start: usize, end: usize) -> Self {
        ParsedCompany {
            all: record.to_string(),
            name: company.to_string(),
            start,
            end,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IntermediateRecord {
    pub index: i32,
    pub timestamp: String,
    pub location: String,
    pub name: String,
    pub company: String,
    info: String, // name + company
    #[serde(rename = "infoT2s")]
    pub info_t2s: String, // name + company (traditional to simplified)
    #[serde(rename = "infoJieba")]
    pub info_jieba: Vec<String>, // name + company (jieba)
    #[serde(rename = "parsedName")]
    pub parsed_name: Option<String>, // name (parsed)
    #[serde(rename = "parsedClass")]
    pub parsed_class: Option<(f32, String, String)>, // class (parsed)
    #[serde(rename = "matchedClass")]
    pub matched_class: Option<String>, // class (matched)
    #[serde(rename = "parsedCompany")]
    pub parsed_company: Option<ParsedCompany>, // company (parsed)
}

impl IntermediateRecord {
    pub fn new(
        source_record: SourceRecord,
        t2s_convert: &dyn Fn(&str) -> String,
    ) -> IntermediateRecord {
        let info = format!("{} {}", source_record.name, source_record.company);
        let info_t2s = t2s_convert(&info);
        IntermediateRecord {
            index: source_record.index,
            timestamp: source_record.timestamp,
            location: source_record.location,
            name: source_record.name,
            company: source_record.company,
            info,
            info_t2s,
            info_jieba: vec![],
            parsed_name: None,
            parsed_class: None,
            matched_class: None,
            parsed_company: None,
        }
    }

    pub fn update_info(&mut self, t2s_convert: &dyn Fn(&str) -> String) {
        let info = format!("{} {}", self.name, self.company);
        self.info = info;
        self.info_t2s = t2s_convert(&self.info);
    }

    pub fn set_parsed_company(&mut self, company: ParsedCompany) {
        self.parsed_company = Some(company);
    }

    pub fn set_name_and_class(
        &mut self,
        name: Option<String>,
        class: Option<(f32, String, String)>,
        matched_class: Option<String>,
    ) {
        self.parsed_name = name;
        self.parsed_class = class;
        self.matched_class = matched_class;
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum RecordMatchingResult {
    Certainty,
    Probably,
    Possibility,
    Improbability,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IntermediateRecordGroup {
    #[serde(rename = "certaintyRecords")]
    pub certainty_records: Vec<IntermediateRecord>,
    #[serde(rename = "probablyRecords")]
    pub probably_records: Vec<IntermediateRecord>,
    #[serde(rename = "possibilityRecords")]
    pub possibility_records: Vec<IntermediateRecord>,
    #[serde(rename = "improbabilityRecords")]
    pub improbability_records: Vec<IntermediateRecord>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubCategoryRecordGroup {
    #[serde(rename = "normalRecords")]
    pub normal_records: Vec<IntermediateRecord>,
    #[serde(rename = "incompleteRecords")]
    pub incomplete_records: Vec<IntermediateRecord>,
    #[serde(rename = "suspensionRecords")]
    pub suspension_records: Vec<IntermediateRecord>,
    #[serde(rename = "mismatchRecords")]
    pub mismatch_records: Vec<IntermediateRecord>,
}
