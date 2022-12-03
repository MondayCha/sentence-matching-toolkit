use crate::utils::{paths, rules::MatchingRule};
use csv::Reader;
use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    fs::File,
    io::{Result, Write},
    path::PathBuf,
};
use tauri::PathResolver;

/// nr  人名\
/// ns  地名\
/// nt	机构名\
/// nw	作品名
#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum DictType {
    PER,
    ORG,
}

/// Receive name list to create name set
#[derive(Default, Debug, Serialize, Deserialize)]
pub struct DictHandler {
    #[serde(skip)]
    dict_handler_path: PathBuf,
    #[serde(skip)]
    dict_path: PathBuf,
    pub dict: BTreeMap<String, DictType>,
    pub size: usize,
}

impl DictHandler {
    pub fn new(path_resolver: &PathResolver) -> Self {
        let dict_handler_path = paths::dict_handler_path(&path_resolver).unwrap_or_default();
        let output_dict_path = paths::dictionary_path(&path_resolver).unwrap_or_default();
        let default_dict_handler = DictHandler {
            dict_handler_path: dict_handler_path.clone(),
            dict_path: output_dict_path.clone(),
            dict: BTreeMap::default(),
            size: 0,
        };
        if !dict_handler_path.exists() {
            return default_dict_handler;
        } else {
            let dict_handler_file = match File::open(&dict_handler_path) {
                Ok(file) => file,
                Err(_) => {
                    return default_dict_handler;
                }
            };
            let mut dict_handler: Self = match serde_json::from_reader(dict_handler_file) {
                Ok(dict_handler) => dict_handler,
                Err(err) => {
                    println!("dict_handler_file: {:?}", err);
                    return default_dict_handler;
                }
            };
            dict_handler.dict_handler_path = dict_handler_path;
            dict_handler.dict_path = output_dict_path;
            return dict_handler;
        };
    }

    fn save(&self) -> Result<()> {
        let dict_handler_data = serde_json::to_string(self).unwrap();
        let mut f = File::create(&self.dict_handler_path)?;
        f.write_all(dict_handler_data.as_bytes())?;
        Ok(())
    }

    fn add(&mut self, name: &str, tag: Option<DictType>) {
        self.dict
            .insert(name.to_string(), tag.unwrap_or(DictType::PER));
    }

    pub fn load_vec(&mut self, name_list: &Vec<String>, tag: Option<DictType>) {
        for name in name_list {
            self.add(name, tag);
        }
        self.size = self.dict.len();
    }

    pub fn load_rule(&mut self, matching_rule: &MatchingRule) -> Result<()> {
        self.add(&matching_rule.rule_name, Some(DictType::ORG));
        if let Some(sub_category) = &matching_rule.sub_category {
            for c in sub_category.csv.classes.iter() {
                if let Some(identity) = &c.identity {
                    self.add(&identity, Some(DictType::ORG));
                }
                if let Some(grade) = &c.grade {
                    self.add(&grade, Some(DictType::ORG));
                }
                if let Some(sequence) = &c.sequence {
                    self.add(&sequence, Some(DictType::ORG));
                }
            }
        }
        Ok(())
    }

    pub fn load_csv(
        &mut self,
        csv_path: &str,
        column: Option<usize>,
        tag: Option<DictType>,
    ) -> Result<()> {
        let mut rdr = Reader::from_path(csv_path)?;
        for result in rdr.records() {
            let record = result?;
            let name = record.get(column.unwrap_or(0)).unwrap_or("");
            if name != "" {
                self.add(name, tag);
            }
        }
        self.size = self.dict.len();
        Ok(())
    }

    pub fn export_dict(&self) -> Result<()> {
        let mut output_file = std::fs::File::create(&self.dict_path)?;
        for (name, tag) in &self.dict {
            match tag {
                DictType::PER => {
                    writeln!(output_file, "{} 5 nr", name)?;
                }
                DictType::ORG => {
                    writeln!(output_file, "{} 5 nt", name)?;
                }
            }
        }
        self.save()?;
        Ok(())
    }

    pub fn can_match_key(&self, info: &str) -> bool {
        for key in self.dict.keys() {
            if info.contains(key) {
                return true;
            }
        }
        false
    }
}
