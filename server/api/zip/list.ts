import z from "zod";
import { defineCompose } from "../../utils/compose";
import { useJSON, validateQuery } from "../../utils/validation";
import { ZIPPath } from "../../utils/zip";
export const schema = z.object({
    /** zip 地址 */
    url: z.string(),
});

export default defineCachedCompose(validateQuery(schema), async (event) => {
    const params: z.infer<typeof schema> = useJSON(event);
    const zip = new ZIPPath(decodeURIComponent(params.url));
    await zip.cacheFetch();
    return zip.getPaths();
})({
    maxAge: 30 * 24 * 60 * 60,
});
