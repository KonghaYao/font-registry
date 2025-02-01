### 我们的多级字体缓存架构

```txt
Nuxt Page
|
CSS File <result.css> 第三级缓存
|
VITE_CDN_ROOT 门户转接服务
|
N * CDN Server <CDN 网关统一转接多个分 CDN 服务> 第二级缓存
|
Other Netlify CDN Server </v2/* redirect>
|
Nuxt Server </api/source/*> 第一级缓存
|
NUXT_OSS_ROOT 源站
```

1. 第一级缓存是 OSS 的防护缓存，由 Netlify Edge Function 提供，防止源站被攻击导致 OSS 宕机
2. 第二级缓存是边缘缓存，将缓存能力扩展到里用户最近的地区
3. 第三级缓存是浏览器静态缓存，由 HTTP 头部控制

### 字体构建流程

```txt
/api/prebuild-font
|
查询 Database <download_url,build_path>
|
NUXT_SPLIT_SERVER （负责构建字体文件）
|
| <如果是 zip 复合文件> -> /api/zip/get -> NUXT_ZIP_SERVER
|
NUXT_OSS_ROOT （负责存储字体文件）
|
Nuxt Server </api/source/*> （纯转接地址）
```
