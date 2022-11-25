use rust_embed::RustEmbed;
/// Rust Traditional Chinese to Simplified Chinese
/// read dictionary from file
use std::collections::HashMap;
use tauri::regex::Regex;

#[derive(RustEmbed)]
#[folder = "resources/"]
struct Asset;

pub struct T2SHandler {
    dict: HashMap<String, String>,
}

impl T2SHandler {
    pub fn new() -> Self {
        let mut dict = HashMap::new();

        let t2s_single_word = Asset::get("t2s-single-word.txt").unwrap();

        // read dictionary from file by line
        // format: traditional simplified
        let t2s_splited_data = std::str::from_utf8(t2s_single_word.data.as_ref())
            .unwrap()
            .split_whitespace();

        for line in t2s_splited_data {
            let mut line = line.split(',');
            let traditional = line.next().unwrap();
            let simplified = line.next().unwrap();
            dict.insert(traditional.to_string(), simplified.to_string());
        }

        Self { dict }
    }

    /// pre-process text and convert to simplified chinese
    pub fn convert(&self, text: &str) -> String {
        let mut result = String::new();

        // Replace multiple spaces with single space
        let re = Regex::new(r"\s+").unwrap();
        let text = re.replace_all(text, " ");

        for c in text.chars() {
            if let Some(simplified) = self.dict.get(&c.to_string()) {
                result.push_str(simplified);
            } else {
                result.push(c);
            }
        }
        result
    }
}
