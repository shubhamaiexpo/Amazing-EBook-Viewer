//! Saved data: settings, bookmarks and reading progress, kept in one JSON file.
//!
//! Where it lives:
//! - Portable: if a folder named `PaperBookData` sits next to the app (the portable zip ships one),
//!   everything is saved there, so the app can run from a USB stick and leave nothing on the PC.
//! - Otherwise: the system's app data folder (e.g. %APPDATA%\app.paperbook.reader on Windows).

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::Serialize;
use tauri::State;

pub const PORTABLE_DIR: &str = "PaperBookData";
const FILE: &str = "paper-book.json";

/// The portable data folder, if the app is running in portable mode.
pub fn portable_dir() -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    portable_dir_beside(exe.parent()?)
}

fn portable_dir_beside(dir: &Path) -> Option<PathBuf> {
    let p = dir.join(PORTABLE_DIR);
    p.is_dir().then_some(p)
}

pub struct Store {
    dir: PathBuf,
    lock: Mutex<()>,
}

#[derive(Serialize)]
pub struct Loaded {
    data: String,
    location: String,
}

impl Store {
    pub fn new(dir: PathBuf) -> Self {
        Self {
            dir,
            lock: Mutex::new(()),
        }
    }

    fn path(&self) -> PathBuf {
        self.dir.join(FILE)
    }

    pub fn load(&self) -> std::io::Result<String> {
        match fs::read_to_string(self.path()) {
            Ok(s) => Ok(s),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok("{}".into()),
            Err(e) => Err(e),
        }
    }

    /// Writes to a temporary file first, then swaps it in, so a crash mid-save never leaves half a file.
    pub fn save(&self, data: &str) -> Result<(), String> {
        serde_json::from_str::<serde_json::Value>(data).map_err(|e| format!("not JSON: {e}"))?;
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        fs::create_dir_all(&self.dir).map_err(|e| e.to_string())?;
        let tmp = self.dir.join(format!("{FILE}.tmp"));
        let mut f = fs::File::create(&tmp).map_err(|e| e.to_string())?;
        f.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        f.sync_all().map_err(|e| e.to_string())?;
        fs::rename(&tmp, self.path()).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn storage_load(store: State<'_, Store>) -> Result<Loaded, String> {
    Ok(Loaded {
        data: store.load().map_err(|e| e.to_string())?,
        location: store.dir.to_string_lossy().into_owned(),
    })
}

#[tauri::command]
pub fn storage_save(data: String, store: State<'_, Store>) -> Result<(), String> {
    store.save(&data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn starts_empty_and_round_trips() {
        let dir = tempfile::tempdir().unwrap();
        let store = Store::new(dir.path().join("data"));
        assert_eq!(store.load().unwrap(), "{}");
        store.save(r#"{"settings":{"theme":"mint"}}"#).unwrap();
        assert_eq!(store.load().unwrap(), r#"{"settings":{"theme":"mint"}}"#);
        assert!(!dir.path().join("data").join("paper-book.json.tmp").exists());
    }

    #[test]
    fn refuses_anything_that_is_not_json() {
        let dir = tempfile::tempdir().unwrap();
        let store = Store::new(dir.path().to_path_buf());
        assert!(store.save("{oops").is_err());
        assert_eq!(store.load().unwrap(), "{}");
    }

    #[test]
    fn portable_only_when_the_folder_exists() {
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(portable_dir_beside(dir.path()), None);
        fs::create_dir(dir.path().join(PORTABLE_DIR)).unwrap();
        assert_eq!(
            portable_dir_beside(dir.path()),
            Some(dir.path().join(PORTABLE_DIR))
        );
    }
}
