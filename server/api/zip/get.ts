import z, { output } from "zod";
import { defineCompose, EndPoint, WrappedEventHandler } from "../../utils/compose";
import { useJSON, validateQuery } from "../../utils/validation";
import { ZIPPath } from "../../utils/zip";
import { hash } from "ohash";
import { cacheLayer } from "~/server/utils/cache";
export const schema = z.object({
    /** zip 地址 */
    url: z.string(),
    /** zip 内部的文件路径 */
    path: z.string(),
});

// 下载 zip 内的文件
const api = defineCompose(validateQuery(schema), cacheLayer(), async (event) => {
    const params: z.infer<typeof schema> = useJSON(event);
    const url = decodeURIComponent(params.url);
    const zip = new ZIPPath(url);
    await zip.cacheFetch();
    // 设置响应头部
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    setResponseHeader(event, "Content-Disposition", `attachment; filename=${params.path.split("/").at(-1)}`);
    const data = await zip.getFile(params.path);
    if (!data) throw new NotFoundError();
    setResponseHeader(event, "etag", "W/" + hash(url));
    return new Blob([data]);
});
export default api;
