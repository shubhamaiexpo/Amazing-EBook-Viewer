//! Opening PDFs. The web UI can only read files the person chose in the open dialog:
//! `pick_pdf` remembers each chosen path and `read_pdf` refuses any other.

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::Serialize;
use tauri::ipc::Response;
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

#[derive(Default)]
pub struct Picked(Mutex<HashSet<PathBuf>>);

#[derive(Serialize)]
pub struct PickedPdf {
    path: String,
    name: String,
}

#[tauri::command]
pub async fn pick_pdf(app: AppHandle, picked: State<'_, Picked>) -> Result<Option<PickedPdf>, String> {
    let Some(file) = app
        .dialog()
        .file()
        .set_title("Open a PDF")
        .add_filter("PDF", &["pdf"])
        .blocking_pick_file()
    else {
        return Ok(None);
    };
    let path = file.into_path().map_err(|e| e.to_string())?;
    picked.0.lock().map_err(|e| e.to_string())?.insert(path.clone());
    Ok(Some(PickedPdf {
        name: display_name(&path),
        path: path.to_string_lossy().into_owned(),
    }))
}

/// Returns the file's bytes as a raw binary response (no JSON encoding, so large PDFs stay fast).
#[tauri::command]
pub async fn read_pdf(path: String, picked: State<'_, Picked>) -> Result<Response, String> {
    let path = PathBuf::from(path);
    if !picked.0.lock().map_err(|e| e.to_string())?.contains(&path) {
        return Err("Paper Book can only open files chosen in its open dialog.".into());
    }
    let bytes = tauri::async_runtime::spawn_blocking(move || std::fs::read(path))
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())?;
    Ok(Response::new(bytes))
}

fn display_name(path: &Path) -> String {
    path.file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Untitled.pdf".into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_come_from_the_file_name() {
        assert_eq!(display_name(Path::new("/books/The Lake.pdf")), "The Lake.pdf");
        assert_eq!(display_name(Path::new("/")), "Untitled.pdf");
    }
}
