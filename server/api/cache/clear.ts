import { z } from "zod";

export const schema = z.object({
    name: z.optional(z.string()),
});
export default defineCompose(authLayer, validateJSON(schema), async (event) => {
    const store = useStorage("cache");
    const data = useJSON<z.infer<typeof schema>>(event);
    if (data.name) {
        await store.removeItem(data.name);
        return { code: 0 };
    } else {
        await store.clear();
        return { code: 0 };
    }
});
