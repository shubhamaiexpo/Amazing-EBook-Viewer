//! Paper Book's desktop core. Deliberately small: the reader is the web UI in ../src;
//! Rust only opens files the person picks and keeps saved data in one JSON file.

mod files;
mod storage;

use tauri::Manager;

pub fn run() {
    // Running from a USB stick: keep the web view's own data beside the app too, so nothing is left on the PC.
    #[cfg(windows)]
    if let Some(dir) = storage::portable_dir() {
        std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", dir.join("webview"));
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(files::Picked::default())
        .setup(|app| {
            let dir = match storage::portable_dir() {
                Some(dir) => dir,
                None => app.path().app_data_dir()?,
            };
            app.manage(storage::Store::new(dir));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            files::pick_pdf,
            files::read_pdf,
            storage::storage_load,
            storage::storage_save,
        ])
        .run(tauri::generate_context!())
        .expect("Paper Book couldn't start");
}
