import z from "zod";
import { defineCompose } from "../../utils/compose";
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
const api = defineCompose(
    validateQuery(schema),
    cacheLayer({
        before(event) {
            const params: z.infer<typeof schema> = useJSON(event);
            setResponseHeader(event, "Content-Type", "application/octet-stream");
            setResponseHeader(event, "Content-Disposition", `attachment; filename=${params.path.split("/").at(-1)}`);
        },
    }),
    async (event) => {
        const params: z.infer<typeof schema> = useJSON(event);
        const url = decodeURIComponent(params.url);
        const zip = new ZIPPath(url);
        const data = await zip.getFile(decodeURIComponent(params.path));
        if (!data) throw new NotFoundError();
        return new Blob([data]);
    }
);
export default api;
