use std::io::Read;

use crate::{ContentResult, ListResult, ZIPLike};
use zip::ZipArchive;

pub struct ZIPAdapter {
    pub zip_data: Vec<u8>,
}

impl ZIPLike for ZIPAdapter {
    fn get_content(&self, path: &str) -> Result<ContentResult, String> {
        // 解析ZIP文件
        let mut archive = ZipArchive::new(std::io::Cursor::new(&self.zip_data))
            .expect("Failed to parse zip file");
        for i in 0..archive.len() {
            let mut file = archive.by_index(i).unwrap();
            if file.enclosed_name().unwrap().to_string_lossy() == path.clone() {
                let mut content = Vec::new();
                file.read_to_end(&mut content)
                    .expect("Failed to read file from zip");

                return Ok(ContentResult {
                    content,
                    name: file.name().to_string(),
                });
            }
        }
        Err("File not found in zip".to_string())
    }
    fn list_paths(&self) -> Result<Vec<ListResult>, String> {
        // 解析 ZIP 文件并提取所有文件路径
        let mut archive = ZipArchive::new(std::io::Cursor::new(&self.zip_data))
            .expect("Failed to parse zip file");
        let paths: Vec<ListResult> = (0..archive.len())
            .filter_map(|i| {
                let file = archive.by_index(i).ok()?;
                if file.is_dir() {
                    return None;
                }
                let file_name = file
                    .enclosed_name()
                    .map(|p| p.to_string_lossy().into_owned());
                let file_size = file.size();
                Some(ListResult {
                    size: file_size,
                    name: file_name.unwrap(),
                })
            })
            .collect();
        Ok(paths)
    }
}
