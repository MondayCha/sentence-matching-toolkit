/// https://jonaskruckenberg.github.io/tauri-docs-wip/development/inter-process-communication.html#error-handling
use serde::{ser::Serializer, Serialize};

#[derive(thiserror::Error, Debug)]
pub enum ChaosError {
    #[error(transparent)]
    Other(#[from] anyhow::Error), // source and Display delegate to anyhow::Error
}

// we must manually implement serde::Serialize
impl Serialize for ChaosError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub type AResult<T, E = ChaosError> = anyhow::Result<T, E>;
