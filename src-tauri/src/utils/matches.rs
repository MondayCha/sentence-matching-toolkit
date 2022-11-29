use crate::handler::{
    dict_handler::DictHandler,
    regex_handler::{RegexMatchHandler, RegexNumHandler},
};

use super::records::RecordMatchingResult;

pub struct RecordMatcher {
    filter: RegexNumHandler,
    matcher: RegexMatchHandler,
}

impl RecordMatcher {
    pub fn new() -> Self {
        Self {
            filter: RegexNumHandler::new(),
            matcher: RegexMatchHandler::new(),
        }
    }

    pub fn match_category(
        &self,
        record: &str,
        dict_handler: &DictHandler,
    ) -> (RecordMatchingResult, String) {
        let record = self.filter.replace_all(record);

        if self.matcher.match_accept(&record) {
            let suspected_category = self.matcher.find_accept(&record);
            match suspected_category {
                Some(category) => {
                    println!("Matched category: {}", category);
                    if self.matcher.match_reject(&category)
                        || self.matcher.match_reject_city(&record)
                    {
                        (RecordMatchingResult::Possibility, category)
                    } else {
                        (RecordMatchingResult::Certainty, category)
                    }
                }
                None => (RecordMatchingResult::Improbability, "".to_string()),
            }
        } else {
            if dict_handler.can_match_key(&record) {
                (RecordMatchingResult::Probably, "".to_string())
            } else {
                (RecordMatchingResult::Improbability, "".to_string())
            }
        }
    }
}
