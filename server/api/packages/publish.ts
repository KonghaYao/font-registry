import { boolean, z } from "zod";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseClient } from "#supabase/server";

// 定义 packages 表的 Zod schema
const PublishPackageSchema = z.object({
    id: z.number(),
    is_published: z.boolean().default(false),
});

const api = defineCompose(authLayer, validateJSON(PublishPackageSchema), async (event) => {
    const data: z.infer<typeof PublishPackageSchema> = useJSON(event);
    const client = await serverSupabaseClient(event);
    const user = useUser(event)!;

    const pkg = useSupabaseQuery(await client.from("packages").select("*").eq("id", data.id).single());

    if (data.is_published) {
        // 发布的校验
        if (!pkg.data.latest) {
            throw new NotFoundError("未找到最后版本");
        }
        if (pkg.data.latest !== pkg.data.style?.version) {
            throw new NotFoundError("最终版本未正确发布 " + pkg.data.latest + " " + pkg.data.style?.version);
        }
    }
    useSupabaseQuery(await client.from("packages").update({ is_published: data.is_published }).eq("id", data.id));
    return { code: 0 };
});
export default api;
