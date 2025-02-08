import { boolean, z } from "zod";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseClient } from "#supabase/server";

// 定义 packages 表的 Zod schema
const UpsertPackageSchema = z.union([
    z.object({
        package_id: z.number(),
        id: z.number().optional(),
        dryRun: z.boolean(),
    }),
    z.object({
        package_id: z.number(),
        id: z.number().optional(),
        isLatest: z.boolean(),

        version: z.string(),
        description: z.string(),
    }),
]);

const api = defineCompose(authLayer, validateJSON(UpsertPackageSchema), async (event) => {
    const data: z.infer<typeof UpsertPackageSchema> = useJSON(event);
    const client = await serverSupabaseClient(event);
    const user = useUser(event)!;

    const pkg = useSupabaseQuery(await client.from("packages").select().eq("id", data.package_id).single());

    let resultItem;
    if ("dryRun" in data) {
        if (data.id) {
            resultItem = useSupabaseQuery(
                await client
                    .from("versions")
                    .select("*,assets!left(*)")
                    .eq("id", data.id)
                    .eq("package_id", data.package_id)
                    .single()
            ).data;
        }
    } else {
        const isUpdate = typeof data.id === "number";
        const content = {
            ...data,
            user_id: user.id,
        };
        /** @ts-ignore */
        delete content.isLatest;
        const builder = client.from("versions");

        let res = isUpdate
            ? useSupabaseQuery(await builder.update(content).eq("id", data.id!).select())
            : useSupabaseQuery(await builder.insert([content]).select());
        resultItem = res.data[0];
        if (content.isLatest) {
            useSupabaseQuery(
                await client
                    .from("packages")
                    .update({
                        latest: resultItem.version!,
                    })
                    .eq("id", data.package_id)
                    .single()
            );
        }
    }
    return {
        code: 0,
        data: {
            package: pkg.data,
            version: resultItem,
        },
    };
});
export default api;
