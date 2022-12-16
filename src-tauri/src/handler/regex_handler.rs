use crate::utils::rules::MatchingRule;
use anyhow::Result;
use tauri::regex::Regex;

pub struct RegexNumHandler {
    re_num_0: Regex,
    re_num_1: Regex,
    re_num_2: Regex,
    re_num_3: Regex,
    re_num_4: Regex,
    re_num_5: Regex,
    re_num_6: Regex,
    re_num_7: Regex,
    re_num_8: Regex,
    re_num_9: Regex,
}

impl RegexNumHandler {
    pub fn new() -> Result<Self> {
        Ok(Self {
            re_num_0: Regex::new(r"[〇零oO]")?,
            re_num_1: Regex::new(r"[1壹|①\-—一]")?,
            re_num_2: Regex::new(r"[2贰②二]")?,
            re_num_3: Regex::new(r"[3叁③三]")?,
            re_num_4: Regex::new(r"[4肆④四]")?,
            re_num_5: Regex::new(r"[5伍⑤五]")?,
            re_num_6: Regex::new(r"[6陆⑥六]")?,
            re_num_7: Regex::new(r"[7柒⑦七]")?,
            re_num_8: Regex::new(r"[8捌⑧八]")?,
            re_num_9: Regex::new(r"[9玖⑨九]")?,
        })
    }

    pub fn replace_all(&self, text: &str) -> String {
        let text = self.re_num_0.replace_all(text, "0");
        let text = self.re_num_1.replace_all(&text, "1");
        let text = self.re_num_2.replace_all(&text, "2");
        let text = self.re_num_3.replace_all(&text, "3");
        let text = self.re_num_4.replace_all(&text, "4");
        let text = self.re_num_5.replace_all(&text, "5");
        let text = self.re_num_6.replace_all(&text, "6");
        let text = self.re_num_7.replace_all(&text, "7");
        let text = self.re_num_8.replace_all(&text, "8");
        let text = self.re_num_9.replace_all(&text, "9");

        text.to_string()
    }
}

pub struct RegexMatchHandler {
    re_accept: Regex,
    re_reject_in_accept: Regex,
    re_reject: Regex,
}

impl RegexMatchHandler {
    pub fn new(rule: &MatchingRule) -> Result<Self> {
        Ok(Self {
            // re_accept: Regex::new(r"(山南|市)(.*?)((职业技术|职业|技术)学[校院]|职[业校院]|1职)")?,
            // re_reject: Regex::new(r"2")?,
            // re_reject_city: Regex::new(r"拉萨市|日喀则市|林芝市|昌都市|那曲市|阿里地区")?,
            re_accept: Regex::new(&rule.category.accept_pattern)?,
            re_reject_in_accept: Regex::new(&rule.category.accept_filter_pattern)?,
            re_reject: Regex::new(&rule.category.reject_pattern)?,
        })
    }

    pub fn match_accept(&self, text: &str) -> bool {
        self.re_accept.is_match(text)
    }

    pub fn match_reject_in_accept(&self, text: &str) -> bool {
        self.re_reject_in_accept.is_match(text)
    }

    pub fn match_reject(&self, text: &str) -> bool {
        self.re_reject.is_match(text)
    }

    pub fn get_target_and_other(&self, text: &str) -> Option<(String, String)> {
        // remove all substring matching the regex from text\
        self.re_accept.find(text).map(|m| {
            (
                m.as_str().to_string(),
                self.re_accept.replace_all(text, "").to_string(),
            )
        })
    }
}
