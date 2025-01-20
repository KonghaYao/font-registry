import z from "zod";
import { defineCompose } from "../../utils/compose";
import { useJSON, validateQuery } from "../../utils/validation";
import { ZIPPath } from "../../utils/zip";
export const schema = z.object({
    /** zip 地址 */
    url: z.string(),
    /** zip 内部的文件路径 */
    path: z.string(),
});

export default defineCompose(validateQuery(schema), async (event) => {
    const params: z.infer<typeof schema> = useJSON(event);
    const zip = new ZIPPath(decodeURIComponent(params.url));
    await zip.cacheFetch();
    return zip.getFile(params.path);
});
