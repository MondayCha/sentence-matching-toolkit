use csv::Reader;
use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    fs::{self, File},
    io::{self, Result, Write},
    path::PathBuf,
};

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
    pub dict: BTreeMap<String, DictType>,
    pub size: usize,
}

impl DictHandler {
    pub fn new(dict_handler_path: PathBuf) -> Result<Self> {
        let dict_handler: Self = if !dict_handler_path.exists() {
            DictHandler {
                dict_handler_path,
                dict: BTreeMap::default(),
                size: 0,
            }
        } else {
            let dict_handler_file = File::open(&dict_handler_path)?;
            let mut dict_handler: Self = serde_json::from_reader(dict_handler_file)
                .map_err(|err| io::Error::new(io::ErrorKind::Other, format!("{:?}", err)))?;
            dict_handler.dict_handler_path = dict_handler_path;
            dict_handler
        };
        Ok(dict_handler)
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
        Ok(())
    }

    pub fn export_dict(&self, output_path: &PathBuf) -> Result<()> {
        let mut output_file = std::fs::File::create(output_path)?;
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
}
