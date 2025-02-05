import { z } from "zod";
import { useJSON } from "../../utils/validation";
import { serverSupabaseClient } from "#supabase/server";

const DeleteSchema = // 删除
    z.object({
        id: z.number(),
        version_id: z.number().int(),
        is_delete: z.boolean(),
    });

const UpdateSchema = // 更新
    z.object({
        id: z.number().optional(),
        version_id: z.number().int(),
        assets_name: z.string(),
        download_url: z.string(),
        size: z.number().default(0),
        // user_id: z.string().uuid().nullable(),
    });

// 定义 packages 表的 Zod schema
const UpsertPackageSchema = z.array(z.union([DeleteSchema, UpdateSchema]));

const api = defineCompose(authLayer, validateJSON(UpsertPackageSchema), async (event) => {
    const data: z.infer<typeof UpsertPackageSchema> = useJSON(event);
    const client = await serverSupabaseClient(event);
    const user = useUser(event)!;

    const { deleteArray, upsertArray } = data.reduce(
        (col, cur) => {
            if ("is_delete" in cur) {
                col.deleteArray.push(cur);
            } else {
                col.upsertArray.push(cur);
            }
            return col;
        },
        {
            deleteArray: [] as z.infer<typeof DeleteSchema>[],
            upsertArray: [] as z.infer<typeof UpdateSchema>[],
        }
    );
    if (deleteArray.length) {
        console.log("deleteArray", deleteArray);
        useSupabaseQuery(
            await client
                .from("assets")
                .delete()
                .in(
                    "id",
                    deleteArray.map((item) => item.id)
                )
        );
    }
    if (upsertArray.length) {
        useSupabaseQuery(
            await client.from("assets").upsert(
                upsertArray.map((item) => ({
                    ...item,
                    user_id: user.id,
                }))
            )
        );
    }
    return {
        code: 0,
        data: {},
    };
});
export default api;
