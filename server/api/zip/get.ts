import z, { output } from "zod";
import { defineCompose, EndPoint, WrappedEventHandler } from "../../utils/compose";
import { useJSON, validateQuery } from "../../utils/validation";
import { ZIPPath } from "../../utils/zip";
export const schema = z.object({
    /** zip 地址 */
    url: z.string(),
    /** zip 内部的文件路径 */
    path: z.string(),
});

// 下载 zip 内的文件
const api = defineCompose(validateQuery(schema), async (event) => {
    const params: z.infer<typeof schema> = useJSON(event);
    const url = decodeURIComponent(params.url).replace("github.com", "ghproxy.cn/github.com");
    const zip = new ZIPPath(url);
    await zip.cacheFetch();
    // 设置响应头部
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    setResponseHeader(event, "Content-Disposition", `attachment; filename=${params.path.split("/").at(-1)}`);

    // 发送文件流作为响应
    event.node.res.statusCode = 200;
    return zip.getFile(params.path);
});
type Input = typeof api extends WrappedEventHandler<infer I, unknown> ? I : never;
type Output = typeof api extends WrappedEventHandler<unknown, infer O> ? O : never;
export default api;
