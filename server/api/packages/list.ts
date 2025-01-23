import z from "zod";
import { defineCachedCompose } from "../../utils/compose";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseServiceRole } from "#supabase/server";
export const schema = z.object({
    /* 查询参数 */
    query: z.optional(z.string()),
});

export default defineCachedCompose(validateQuery(schema), async (event) => {
    const data: z.infer<typeof schema> = useJSON(event);
    const client = serverSupabaseServiceRole(event);
    let chain = client
        .from("packages")
        .select("name,latest,keywords,name_cn,created_at,homepage,description,license,author!inner(*)");

    if (data.query)
        chain = chain.or(["name", "name_cn", "description"].map((i) => `${i}.ilike.%${data.query}%`).join(","));
    return chain.order("created_at", { ascending: false }).limit(10);
})({
    maxAge: 10 * 60,
    getKey: (e) => e.path,
});
