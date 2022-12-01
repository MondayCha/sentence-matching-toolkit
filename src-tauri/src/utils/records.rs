use serde::{Deserialize, Serialize};

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

#[derive(Debug, Serialize, Deserialize)]
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
    pub parsed_class: Option<String>, // class (parsed)
    #[serde(rename = "parsedCompany")]
    pub parsed_company: Option<(String, usize, usize)>, // company (parsed)
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
            parsed_company: None,
        }
    }

    pub fn set_parsed_company(&mut self, company: (String, usize, usize)) {
        self.parsed_company = Some(company);
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
