use jieba_rs::Jieba;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::PathBuf;

// let mut jieba = Jieba::new();
// jieba.add_word("久美曲旦", None, None);
// jieba.add_word("洛桑旦增", None, None);
// let name_and_company = format!("{} {}", record.name, record.company);
// println!("{}", jieba.cut(&name_and_company, false).join("/"));

pub struct JiebaHandler {
    jieba: Jieba,
}

impl JiebaHandler {
    pub fn new(dict_path: &PathBuf) -> Self {
        let mut jieba = Jieba::new();

        // https://github.com/fxsjy/jieba/issues/14
        if dict_path.exists() {
            let mut dict_str = String::new();

            File::open(dict_path)
                .expect("file not found")
                .read_to_string(&mut dict_str)
                .expect("read dict failed");
            let mut reader = BufReader::new(dict_str.as_bytes());
            jieba.load_dict(&mut reader).expect("load dict failed")
        }

        Self { jieba }
    }

    pub fn cut(&self, text: &str) -> Vec<String> {
        self.jieba
            .cut(text, false)
            .into_iter()
            .map(|s| s.to_string())
            .collect()
    }
}
