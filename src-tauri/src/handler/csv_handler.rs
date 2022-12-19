use std::{
    fs::File,
    io::{Read, Write},
    path::PathBuf,
};

use anyhow::{anyhow, Result};
use csv::Reader;

use crate::utils::{
    classes::{ClassInfo, IntermediateClassInfo, SubCategoryCSV},
    paths::get_filename_from_path,
};

pub struct CsvHandler {
    pub headers: Vec<String>,
}

impl CsvHandler {
    pub fn new(headers: Vec<String>) -> Self {
        Self { headers }
    }

    /// `check_csv_availablity` 检查输入的 CSV 文件是否符合要求，包括以下几点：
    ///
    /// 1. 文件是否存在
    /// 2. 列数是否符合要求
    /// 3. 列名是否符合要求
    ///
    /// 如果符合要求，返回 `Ok(String)`，其中 `String` 为文件名
    pub fn check_csv_availablity(&self, csv_path: &str) -> Result<(String, String, String)> {
        let path = std::path::Path::new(csv_path);
        if !path.exists() {
            return Err(anyhow!("文件 {:?} 不存在", csv_path));
        }
        let mut rdr = Reader::from_path(path)?;
        let headers = rdr.headers()?;

        if self.headers.len() != headers.len() {
            return Err(anyhow!(
                "输入 CSV 文件应有 {} 列，检测到 {} 列，不符合要求。",
                self.headers.len(),
                headers.len()
            ));
        }

        for (i, header) in headers.iter().enumerate() {
            if header != self.headers[i] {
                return Err(anyhow!(
                    "输入 CSV 文件第 {} 列应为 {:?}，检测到 {:?}，不符合要求。",
                    i + 1,
                    self.headers[i],
                    header
                ));
            }
        }

        let csv_name = get_filename_from_path(path);

        Ok(csv_name)
    }

    /// `read_sub_category_csv` 从输入 CSV 文件读取二级规则
    ///
    /// 返回 `Result<(SubCategoryCSV, String)>`，\
    /// 其中 [`SubCategoryCSV`] 为二级规则，[`String`] 为文件名
    pub fn read_sub_category_csv(csv_path: &str) -> Result<(SubCategoryCSV, String)> {
        let pathbuf = PathBuf::from(csv_path);

        // read class info csv
        let mut rdr = csv::Reader::from_path(&pathbuf)?;
        let mut classes = Vec::new();
        for result in rdr.deserialize() {
            let class_info: ClassInfo = result?;
            classes.push(IntermediateClassInfo::from(class_info));
        }

        let csv_name = get_filename_from_path(&pathbuf);
        let sub_category_csv = SubCategoryCSV {
            name: csv_name.0.clone(),
            available_grade: vec![],
            available_sequence: vec![],
            classes,
        };
        Ok((sub_category_csv, csv_name.0))
    }

    /// `add_utf8_bom` 为输入的 CSV 文件添加 UTF-8 BOM 头\
    /// 以便 Excel 正确识别编码\
    /// 如果文件已经有 BOM 头，则不做任何操作
    pub fn add_utf8_bom(csv_path: &PathBuf) -> Result<()> {
        let mut f = File::open(&csv_path)?;
        let mut content = Vec::new();
        f.read_to_end(&mut content)?;

        if content.starts_with(b"\xEF\xBB\xBF") {
            println!("文件 {:?} 已经有 UTF-8 BOM 头，不做任何操作。", csv_path);
            return Ok(());
        }

        let mut f = File::create(&csv_path)?;
        f.write_all(b"\xEF\xBB\xBF")?;
        f.write_all(content.as_slice())?;
        Ok(())
    }
}
