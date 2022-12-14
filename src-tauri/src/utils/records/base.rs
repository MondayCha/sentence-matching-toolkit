use serde::{Deserialize, Serialize};

/// Source Record is used to read and write csv file.
#[derive(Default, Debug, Serialize, Deserialize)]
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

impl From<BaseRecord> for SourceRecord {
    fn from(record: BaseRecord) -> Self {
        SourceRecord {
            index: record.index,
            timestamp: record.timestamp,
            location: record.location,
            name: record.name,
            company: record.company,
        }
    }
}

/// Base Record is a unit of input data.
#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct BaseRecord {
    pub index: i32,
    pub timestamp: String,
    pub location: String,
    pub name: String,
    pub company: String,
}

impl From<SourceRecord> for BaseRecord {
    fn from(record: SourceRecord) -> Self {
        BaseRecord {
            index: record.index,
            timestamp: record.timestamp,
            location: record.location,
            name: record.name,
            company: record.company,
        }
    }
}
