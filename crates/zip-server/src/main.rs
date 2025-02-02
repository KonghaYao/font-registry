use adapt_7z::SevenZAdapter;
use adapt_zip::ZIPAdapter;
use axum::{
    body::Body,
    extract::Query,
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use percent_encoding::percent_decode_str;
use serde::{Deserialize, Serialize};
use std::{fs, io::Read};
use tower_http::compression::CompressionLayer;
mod adapt_7z;
mod adapt_zip;

/** 统一适配器类型 */
pub trait ZIPLike {
    fn get_content(&self, path: &str) -> Result<ContentResult, String>;
    fn list_paths(&self) -> Result<Vec<ListResult>, String>;
}
/** 获取文件类型解析器，比如 7z 会调用不同的方式进行解析 */
pub fn get_file_type(path: &str, zip_data: Vec<u8>) -> Box<dyn ZIPLike> {
    if path.ends_with(".7z") {
        Box::new(SevenZAdapter { zip_data })
    } else {
        Box::new(ZIPAdapter { zip_data })
    }
}
pub struct ContentResult {
    pub content: Vec<u8>,
    pub name: String,
}

#[derive(Deserialize)]
struct Params {
    url: String,
    path: String,
}
async fn get_zip_content(Query(payload): Query<Params>) -> impl IntoResponse {
    // 解码 URL 和路径
    let decoded_url = percent_decode_str(&payload.url)
        .decode_utf8()
        .unwrap()
        .to_string();

    let decoded_path = percent_decode_str(&payload.path)
        .decode_utf8()
        .unwrap()
        .to_string();

    // 下载ZIP文件
    let zip_data = get_cached_zip_file(&decoded_url).await;

    let zip = get_file_type(&decoded_url, zip_data).get_content(&decoded_path);
    match zip {
        Ok(ContentResult { content, name }) => Response::builder()
            .status(200)
            .header("Content-Type", "application/octet-stream")
            .header(
                "Content-Disposition",
                format!("attachment; filename={}", name),
            )
            .body(Body::from(content))
            .unwrap(),
        Err(_) => Response::builder()
            .status(404)
            .body(Body::from(Vec::new()))
            .unwrap(),
    }
}

#[derive(Deserialize, Debug)]
struct ListParams {
    url: String,
}
#[derive(Serialize)]
pub struct ListResult {
    size: u64,
    name: String,
}

async fn list_zip_paths(Query(payload): Query<ListParams>) -> impl IntoResponse {
    // 解码 URL
    let decoded_url = percent_decode_str(&payload.url)
        .decode_utf8()
        .unwrap()
        .to_string();
    // 下载 ZIP 文件
    let zip_data = get_cached_zip_file(&decoded_url).await;

    let adaptor = get_file_type(&decoded_url, zip_data);
    let paths = adaptor.list_paths().unwrap();
    return serde_json::to_string(&paths).unwrap();
}

async fn get_cached_zip_file(decoded_url: &str) -> Vec<u8> {
    let cache_name = sha256::digest(decoded_url);
    let path_str = format!("/tmp/{}", &cache_name);
    let path = std::path::Path::new(&path_str);

    // 检查文件是否存在
    if path.exists() && path.is_file() {
        // 读取文件内容到 Vec<u8>
        match std::fs::read(path) {
            Ok(content) => return content,
            Err(_) => (),
        }
    }

    println!("get {}", decoded_url);
    // 发起 GET 请求
    let resp = attohttpc::get(decoded_url)
        .send()
        .expect("Failed to fetch the zip file");
    let binary = resp.bytes().expect("Failed to read the zip data").to_vec();
    fs::write(path_str, &binary).expect("写入失败");
    binary
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .layer(CompressionLayer::new())
        .route("/list", get(list_zip_paths))
        .route("/get", get(get_zip_content));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[tokio::test]
    async fn test_submit_endpoint() {
        // 发送 POST 请求
        let res =attohttpc::get("http://localhost:3000/list?url=https%3A%2F%2Fghproxy.cn%2Fgithub.com%2Flxgw%2FLxgwWenKai%2Freleases%2Fdownload%2Fv1.510%2Flxgw-wenkai-v1.510.zip")
            .send()
            .expect("Failed to execute request.");

        // 将响应内容写入文件
        let data = res.text().unwrap();

        assert_eq!(data.len(), 471)
    }
    #[tokio::test]
    async fn test_get_endpoint() {
        // 发送 POST 请求
        let res = attohttpc
            ::get("http://localhost:3000/get?url=https%3A%2F%2Fghproxy.cn%2Fgithub.com%2Flxgw%2FLxgwWenKai%2Freleases%2Fdownload%2Fv1.510%2Flxgw-wenkai-v1.510.zip&path=lxgw-wenkai-v1.510%2FOFL.txt")
            .send()
            .expect("Failed to execute request.");

        // 将响应内容写入文件
        let data = res.text().unwrap();

        assert_eq!(data.len(), 4448)
    }
}
#[cfg(test)]
mod test7z {
    use super::*;
    use serde_json::json;

    #[tokio::test]
    async fn test_submit_endpoint() {
        // 发送 POST 请求
        let res =attohttpc::get("http://localhost:3000/list?url=https%3A%2F%2Fghproxy.cn%2Fgithub.com%2FGuiWonder%2FXiaoheSimplifyFonts%2Freleases%2Fdownload%2F1.004%2FXiaoheSimplifySans-VF.7z")
            .send()
            .expect("Failed to execute request.");

        // 将响应内容写入文件
        let data = res.text().unwrap();
        // println!("{}", data);
        assert_eq!(data.len(), 107)
    }
    #[tokio::test]
    async fn test_get_endpoint() {
        // 发送 POST 请求
        let res = attohttpc
            ::get("http://localhost:3000/get?url=https%3A%2F%2Fghproxy.cn%2Fgithub.com%2FGuiWonder%2FXiaoheSimplifyFonts%2Freleases%2Fdownload%2F1.004%2FXiaoheSimplifySans-VF.7z&path=XiaoheSimplifySans-VF.otf")
            .send()
            .expect("Failed to execute request.");

        // 将响应内容写入文件
        let data = res.text().unwrap();

        assert_eq!(data.len(), 37652861)
    }
}
