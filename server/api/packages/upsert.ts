import { boolean, z } from "zod";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseClient } from "#supabase/server";

// 定义 packages 表的 Zod schema
const UpsertPackageSchema = z.union([
    z.object({
        id: z.number(),
        dryRun: z.boolean(),
    }),
    z.object({
        id: z.number().optional(),
        // created_at: z.date(),
        // from: z.string(),
        // user_id: z.string().uuid(),
        // is_published: z.boolean().default(false),
        latest: z.string().default(""),

        name: z.string(),
        name_cn: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()),
        homepage: z.string().optional(),
        readme: z.string().optional(),
        author: z.number().nullish(),
        license: z.string().nullish(),
    }),
]);

const api = defineCompose(authLayer, validateJSON(UpsertPackageSchema), async (event) => {
    const data: z.infer<typeof UpsertPackageSchema> = useJSON(event);
    const client = await serverSupabaseClient(event);
    const user = useUser(event)!;

    let resultItem;
    if ("dryRun" in data) {
        if (data.dryRun) {
            resultItem = useSupabaseQuery(await client.from("packages").select().eq("id", data.id).single()).data;
        } else {
            throw new NotFoundError();
        }
    } else {
        data.readme = data.readme ? Buffer.from(data.readme, "utf8").toString("base64") : undefined;

        const isUpdate = typeof data.id === "number";
        const content = {
            ...data,
            user_id: user.id,
            created_at: isUpdate ? undefined : new Date().toISOString(),
            from: "user_created",
        };
        const builder = client.from("packages");

        let res = isUpdate
            ? useSupabaseQuery(await builder.update(content).eq("id", data.id!).select())
            : useSupabaseQuery(await builder.insert([content]).select());
        resultItem = res.data[0];
    }

    /** @ts-ignore */
    resultItem.readme = base64ToUtf8(resultItem.readme) as string;
    return { code: 0, data: resultItem };
});
export default api;
