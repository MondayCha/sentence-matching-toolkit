use anyhow::{Context, Result};
use rust_embed::RustEmbed;
/// Rust Traditional Chinese to Simplified Chinese
/// read dictionary from file
use std::collections::HashMap;
use tauri::regex::Regex;

#[derive(RustEmbed)]
#[folder = "resources/"]
pub struct Asset;

pub struct T2SHandler {
    dict: HashMap<String, String>,
}

impl T2SHandler {
    pub fn new() -> Result<Self> {
        let mut dict = HashMap::new();

        let t2s_single_word = Asset::get("t2s-single-word.txt")
            .with_context(|| "Failed to load t2s-single-word.txt")?;

        // read dictionary from file by line
        // format: traditional,simplified
        let t2s_splited_data =
            std::str::from_utf8(t2s_single_word.data.as_ref())?.split_whitespace();

        for (i, line) in t2s_splited_data.enumerate() {
            let mut line = line.split(',');
            let traditional = line
                .next()
                .with_context(|| format!("Failed to read line {}: {:?}", i, line))?;
            let simplified = line
                .next()
                .with_context(|| format!("Failed to read line {}: {:?}", i, line))?;
            dict.insert(traditional.to_string(), simplified.to_string());
        }

        Ok(Self { dict })
    }

    /// pre-process text and convert to simplified chinese
    pub fn convert(&self, text: &str) -> String {
        let mut result = String::new();

        // Replace multiple spaces with single space
        let re = match Regex::new(r"\s+") {
            Ok(re) => re,
            Err(e) => {
                eprintln!("Error: {}", e);
                return text.to_string();
            }
        };

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
