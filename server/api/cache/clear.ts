import { z } from "zod";

export const schema = z.object({
    name: z.optional(z.string()),
    names: z.optional(z.array(z.string())),
});
export default defineCompose(authLayer, validateJSON(schema), async (event) => {
    const store = useStorage("cache");
    const data = useJSON<z.infer<typeof schema>>(event);
    if (data.names) {
        await Promise.all(
            data.names.map(async (name) => {
                await store.removeItem(name);
            })
        );
        return { code: 0 };
    }
    if (data.name) {
        await store.removeItem(data.name);
        return { code: 0 };
    } else {
        await store.clear();
        return { code: 0 };
    }
});
