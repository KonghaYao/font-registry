import { z } from "zod";

// export const schema = z.object({
//     name: z.optional(z.string()),
// });
export default defineCompose(authRunner, async (event) => {
    const store = useStorage("cache");
    return store.getKeys();
});
