use crate::handler::{
    dict_handler::DictHandler,
    regex_handler::{RegexMatchHandler, RegexNumHandler},
};

use super::{records::RecordMatchingResult, rules::MatchingRule};

pub struct RecordMatcher {
    filter: RegexNumHandler,
    matcher: RegexMatchHandler,
}

impl RecordMatcher {
    pub fn new(rule: &MatchingRule) -> Self {
        Self {
            filter: RegexNumHandler::new(),
            matcher: RegexMatchHandler::new(rule),
        }
    }

    pub fn match_category(
        &self,
        record: &str,
        dict_handler: &DictHandler,
    ) -> (RecordMatchingResult, (String, usize, usize)) {
        let record = self.filter.replace_all(record);

        if self.matcher.match_accept(&record) {
            match self.matcher.find_accept(&record) {
                Some(category_info) => {
                    println!("Matched category: {}", category_info.0);
                    if self.matcher.match_reject(&category_info.0)
                        || self.matcher.match_reject_city(&record)
                    {
                        (RecordMatchingResult::Possibility, category_info)
                    } else {
                        (RecordMatchingResult::Certainty, category_info)
                    }
                }
                None => (RecordMatchingResult::Improbability, ("".to_string(), 0, 0)),
            }
        } else {
            if dict_handler.can_match_key(&record) {
                (RecordMatchingResult::Probably, ("".to_string(), 0, 0))
            } else {
                (RecordMatchingResult::Improbability, ("".to_string(), 0, 0))
            }
        }
    }
}
