// 定义一个配置对象，包含文件扩展名及其对应的 content-type
const contentTypeConfig = {
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".css": "text/css",
    // 可以根据需要添加更多扩展名及对应的 content-type
};
export const getContentType = (path: string, cb: (ct: string) => void) => {
    for (const ext in contentTypeConfig) {
        if (path.endsWith(ext)) {
            /**@ts-ignore */
            cb(contentTypeConfig[ext] as string);
            break; // 找到匹配后退出循环
        }
    }
};
