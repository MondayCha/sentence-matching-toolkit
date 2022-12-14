use crate::utils::{
    paths::{self, pathbuf_to_string},
    rules::MatchingRule,
};
use anyhow::{Context, Result};
use csv::{Reader, ReaderBuilder};
use serde::{Deserialize, Serialize};
use std::{
    borrow::Borrow, cmp::Ordering, collections::BTreeSet, fmt::Display, fs::File, io::Write,
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

/// Word is a wrapper for string
#[derive(PartialEq, Eq, Clone, Serialize, Deserialize, Debug)]
struct Word(String);

impl From<String> for Word {
    fn from(s: String) -> Self {
        Word(s)
    }
}

impl Borrow<String> for Word {
    fn borrow(&self) -> &String {
        &self.0
    }
}

impl PartialOrd for Word {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Word {
    fn cmp(&self, other: &Self) -> Ordering {
        other.0.len().cmp(&self.0.len()).then(self.0.cmp(&other.0))
    }
}

impl Display for Word {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Receive name list to create name set
#[derive(Default, Debug, Serialize, Deserialize)]
pub struct DictHandler {
    pub dict_path: PathBuf,
    per_dict: BTreeSet<Word>,
    org_dict: BTreeSet<Word>,
}

impl DictHandler {
    pub fn new(path_resolver: &PathResolver) -> Result<Self> {
        let output_dict_path = paths::dictionary_path(&path_resolver)?;
        if !output_dict_path.exists() {
            let default_dict_handler = DictHandler {
                dict_path: output_dict_path.clone(),
                ..Default::default()
            };
            default_dict_handler.save()?;
            Ok(default_dict_handler)
        } else {
            let mut per_dict: BTreeSet<Word> = BTreeSet::new();
            let mut org_dict: BTreeSet<Word> = BTreeSet::new();

            // load set from txt "{} 5 nr" or "{} 5 nt"
            let input_file = File::open(&output_dict_path)?;

            // read dict txt like csv file
            let mut rdr = ReaderBuilder::new()
                .delimiter(b' ')
                .has_headers(false)
                .from_reader(input_file);
            for result in rdr.records() {
                let record = result?;
                let name = record
                    .get(0)
                    .with_context(|| format!("行 {:?} 找不到单词", &record))?;
                let tag = record
                    .get(2)
                    .with_context(|| format!("行 {:?} 找不到标签", &record))?;
                if tag == "nr" {
                    per_dict.insert(name.to_string().into());
                } else if tag == "nt" {
                    org_dict.insert(name.to_string().into());
                }
            }
            Ok(DictHandler {
                dict_path: output_dict_path,
                per_dict,
                org_dict,
            })
        }
    }

    fn save(&self) -> Result<()> {
        let mut output_file = std::fs::File::create(&self.dict_path)?;
        for per in &self.per_dict {
            writeln!(output_file, "{} 5 nr", per)?;
        }
        for org in &self.org_dict {
            writeln!(output_file, "{} 5 nt", org)?;
        }
        Ok(())
    }

    fn add(&mut self, name: &str, tag: DictType) {
        // if name is empty, return
        if name.is_empty() {
            return;
        }
        // if name is not in dict, add it
        if matches!(tag, DictType::PER) {
            self.per_dict.insert(name.to_string().into());
        } else if matches!(tag, DictType::ORG) {
            self.org_dict.insert(name.to_string().into());
        }
    }

    pub fn size(&self) -> usize {
        self.per_dict.len() + self.org_dict.len()
    }

    pub fn load_rule(&mut self, matching_rule: &MatchingRule) -> Result<()> {
        self.add(&matching_rule.rule_name, DictType::ORG);
        if let Some(sub_category) = &matching_rule.sub_category {
            for c in sub_category.csv.classes.iter() {
                if let Some(identity) = &c.identity {
                    self.add(&identity, DictType::ORG);
                }
                if let Some(grade) = &c.grade {
                    self.add(&grade, DictType::ORG);
                }
                if let Some(sequence) = &c.sequence {
                    self.add(&sequence, DictType::ORG);
                }
            }
        }
        self.save()?;
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
            let name = record
                .get(column.unwrap_or(0))
                .with_context(|| format!("行 {:?} 找不到单词", &record))?;
            self.add(name, tag.unwrap_or(DictType::ORG));
        }
        self.save()?;
        Ok(())
    }

    pub fn load_vec(&mut self, vec: Vec<String>, tag: Option<DictType>) -> Result<()> {
        for str in vec.iter() {
            self.add(str, tag.unwrap_or(DictType::ORG));
        }
        self.save()?;
        Ok(())
    }

    pub fn get_name_from_dict(&self, info: &str) -> Option<String> {
        for key in self.per_dict.iter() {
            // println!("key: {}", key);
            if info.contains(&key.0) {
                return Some(key.to_string());
            }
        }
        None
    }

    pub fn get_dict_path(path_resolver: &PathResolver) -> Result<String> {
        let dict_file_path = paths::dictionary_path(&path_resolver)?;
        let dict_path = pathbuf_to_string(&dict_file_path)?;
        Ok(dict_path)
    }
}
