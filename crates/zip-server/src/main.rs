use axum::{
    body::Body,
    extract::Json,
    response::{IntoResponse, Response},
    routing::post,
    Router,
};
use reqwest::get;
use serde::{Deserialize, Serialize};
use std::{fs, io::Read};
use tower_http::compression::CompressionLayer;
use zip::read::ZipArchive;
#[derive(Deserialize)]
struct Params {
    url: String,
    path: String,
}
async fn get_zip_content(Json(payload): Json<Params>) -> impl IntoResponse {
    // 解码 URL 和路径
    let decoded_url = &payload.url;

    let decoded_path = &payload.path;

    // 下载ZIP文件
    let zip_data = get_cached_zip_file(&decoded_url).await;

    // 解析ZIP文件
    let mut archive =
        ZipArchive::new(std::io::Cursor::new(zip_data)).expect("Failed to parse zip file");
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        if file.enclosed_name().unwrap().to_string_lossy() == decoded_path.clone() {
            let mut content = Vec::new();
            file.read_to_end(&mut content)
                .expect("Failed to read file from zip");

            return Response::builder()
                .status(200)
                .header("Content-Type", "application/octet-stream")
                .header(
                    "Content-Disposition",
                    format!("attachment; filename={}", file.name()),
                )
                .body(Body::from(content))
                .unwrap();
        }
    }

    Response::builder()
        .status(404)
        .body(Body::from(Vec::new()))
        .unwrap()
}

#[derive(Deserialize)]
struct ListParams {
    url: String,
}
#[derive(Serialize)]
struct ListResult {
    size: u64,
    name: String,
}

async fn list_zip_paths(Json(payload): Json<ListParams>) -> impl IntoResponse {
    // 解码 URL
    let decoded_url = &payload.url;

    // 下载 ZIP 文件
    let zip_data = get_cached_zip_file(&decoded_url).await;

    // 解析 ZIP 文件并提取所有文件路径
    let mut archive =
        ZipArchive::new(std::io::Cursor::new(zip_data)).expect("Failed to parse zip file");
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

    // 返回路径列表
    serde_json::to_string(&paths).unwrap()
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
    // 下载 ZIP 文件
    let resp = get(decoded_url)
        .await
        .expect("Failed to fetch the zip file");
    let binary = resp
        .bytes()
        .await
        .expect("Failed to read the zip data")
        .to_vec();
    fs::write(path_str, &binary).expect("写入失败");
    binary
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .layer(CompressionLayer::new())
        .route("/list", post(list_zip_paths))
        .route("/get", post(get_zip_content));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use reqwest::{Body, Client};
    use serde_json::json;

    #[tokio::test]
    async fn test_submit_endpoint() {
        // 创建 HTTP 客户端
        let client = Client::new();

        // 准备请求体
        let payload = json!({
            "url": "https://github.com/lxgw/LxgwWenKai/releases/download/v1.510/lxgw-wenkai-v1.510.zip",
        });

        // 发送 POST 请求
        let res = client
            .post("http://localhost:3000/list")
            .header("Content-Type", "application/json")
            .body(Body::from(serde_json::to_string(&payload).unwrap()))
            .send()
            .await
            .expect("Failed to execute request.");

        // 将响应内容写入文件
        let data = res.text().await.unwrap();

        assert_eq!(data.len(), 471)
    }
    #[tokio::test]
    async fn test_get_endpoint() {
        // 创建 HTTP 客户端
        let client = Client::new();

        // 准备请求体
        let payload = json!({
            "url": "https://github.com/lxgw/LxgwWenKai/releases/download/v1.510/lxgw-wenkai-v1.510.zip",
            "path":"lxgw-wenkai-v1.510/OFL.txt"
        });

        // 发送 POST 请求
        let res = client
            .post("http://localhost:3000/get")
            .header("Content-Type", "application/json")
            .body(Body::from(serde_json::to_string(&payload).unwrap()))
            .send()
            .await
            .expect("Failed to execute request.");

        // 将响应内容写入文件
        let data = res.text().await.unwrap();

        assert_eq!(data.len(), 4448)
    }
}
