import { z } from "zod";
import { clearCacheLayer } from "../utils/cache";
export const schema = z.object({
    pkgId: z.string(),
});
export default defineCompose(
    validateQuery(schema),
    clearCacheLayer((event) => {
        const data: z.infer<typeof schema> = useJSON(event);
        return [`nitro:functions:_:version:${data.pkgId}.json`];
    }),
    async () => {
        return "success";
    }
);
