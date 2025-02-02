use std::io::Read;

use crate::{ContentResult, ListResult, ZIPLike};
use sevenz_rust::Password;
use zip::ZipArchive;

pub struct SevenZAdapter {
    pub zip_data: Vec<u8>,
}

impl ZIPLike for SevenZAdapter {
    fn get_content(&self, path: &str) -> Result<ContentResult, String> {
        let mut obj = sevenz_rust::SevenZReader::new(
            std::io::Cursor::new(&self.zip_data),
            self.zip_data.len() as u64,
            Password::empty(),
        )
        .expect("7z open error");
        let mut content_result: Vec<ContentResult> = Vec::with_capacity(1);
        let _ = obj.for_each_entries(|entry, reader| {
            let mut content = Vec::new();
            reader.read_to_end(&mut content).unwrap();
            if entry.name().to_string() == path {
                content_result.push(ContentResult {
                    content,
                    name: entry.name().to_string(),
                });
                return Ok(false);
            }
            Ok(true)
        });
        if content_result.is_empty() {
            return Err("path not found".to_string());
        }
        Ok(content_result.pop().unwrap())
    }
    fn list_paths(&self) -> Result<Vec<ListResult>, String> {
        let path = std::io::Cursor::new(&self.zip_data);
        let obj =
            sevenz_rust::SevenZReader::new(path, self.zip_data.len() as u64, Password::empty())
                .expect("7z open error");
        let paths = obj
            .archive()
            .files
            .iter()
            .map(|f| ListResult {
                name: f.name().to_string(),
                size: f.size(),
            })
            .collect();
        Ok(paths)
    }
}
