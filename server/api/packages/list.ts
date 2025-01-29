import z from "zod";
import { defineCachedCompose } from "../../utils/compose";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseServiceRole } from "#supabase/server";
import { H3Event } from "h3";
export const schema = z.object({
    /* 查询参数 */
    query: z.optional(z.string()),
});

const api = defineCachedCompose(validateQuery(schema), async (event) => {
    const data: z.infer<typeof schema> = useJSON(event);
    const client = serverSupabaseServiceRole(event);
    let chain = client
        .from("packages")
        .select("name,latest,keywords,name_cn,created_at,from,homepage,description,license,author!inner(*)");

    if (data.query)
        chain = chain.or(["name", "name_cn", "description"].map((i) => `${i}.ilike.%${data.query}%`).join(","));
    return chain.order("created_at", { ascending: false }).limit(10);
})({
    maxAge: 10 * 60,
    getKey: (event: H3Event) => {
        const url = new URL(event.node.req.url!, "http://localhost");
        return `packages:list:${url.search}`;
    },
});
export default api;
