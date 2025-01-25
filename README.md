## 我们的多级字体缓存架构

```text
SPLIT_SERVER （负责切割字体）
| <部署静态网站>
OSS_ROOT （负责存储字体文件）
| <被 Nuxt 转接静态资源>
Nuxt Server
| <CDN 采用 Nuxt 的静态稳定地址>
N * CDN Server
| <CDN 网关统一转接多个分 CDN 服务>
CDN_ROOT
| <前端使用 CDN_ROOT 地址>
Nuxt Page
```
