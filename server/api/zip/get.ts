import z, { output } from "zod";
import { defineCompose, EndPoint, WrappedEventHandler } from "../../utils/compose";
import { useJSON, validateQuery } from "../../utils/validation";
import { ZIPPath } from "../../utils/zip";
import { hash } from "ohash";
export const schema = z.object({
    /** zip 地址 */
    url: z.string(),
    /** zip 内部的文件路径 */
    path: z.string(),
});

// 下载 zip 内的文件
const api = defineCompose(validateQuery(schema), async (event) => {
    const params: z.infer<typeof schema> = useJSON(event);
    const store = useStorage("cache");
    const key = "zip:" + hash(params);
    if (await store.hasItem(key)) {
        return store.getItemRaw(key);
    }
    const url = decodeURIComponent(params.url).replace("github.com", "ghproxy.cn/github.com");
    const zip = new ZIPPath(url);
    await zip.cacheFetch();
    // 设置响应头部
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    setResponseHeader(event, "Content-Disposition", `attachment; filename=${params.path.split("/").at(-1)}`);
    const data = await zip.getFile(params.path);
    if (!data) throw new NotFoundError();
    setResponseHeader(event, "etag", "W/" + hash(url));
    await store.setItemRaw(key, data);
    return new Blob([data]);
});
type Input = typeof api extends WrappedEventHandler<infer I, unknown> ? I : never;
type Output = typeof api extends WrappedEventHandler<unknown, infer O> ? O : never;
export default api;
