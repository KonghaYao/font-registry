import z from "zod";
import { defineCachedCompose } from "../../utils/compose";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseServiceRole } from "#supabase/server";
import { H3Event } from "h3";
import { encodeKey } from "~/server/utils/cache";
export const schema = z.object({
    /* 查询参数 */
    query: z.optional(z.string()),
});

const api = defineCachedCompose(validateQuery(schema), async (event) => {
    const data: z.infer<typeof schema> = useJSON(event);
    const client = serverSupabaseServiceRole(event);
    let chain = client
        .from("packages")
        .select(
            "name,latest,is_published,keywords,name_cn,created_at,from,style,homepage,description,license,author!inner(*)"
        );
    chain = chain.eq("is_published", true);

    if (data.query)
        chain = chain.or(["name", "name_cn", "description"].map((i) => `${i}.ilike.%${data.query}%`).join(","));
    return chain.order("created_at", { ascending: false }).limit(10);
})({
    maxAge: 10 * 60,
    getKey: (event: H3Event) => {
        return encodeKey(event.node.req.url);
    },
});
export default api;
