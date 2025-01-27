import z from "zod";
import { defineCachedCompose } from "../../utils/compose";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseServiceRole } from "#supabase/server";
export const schema = z.object({
    pkgId: z.string(),
});

const api = defineCachedCompose(validateQuery(schema), async (event) => {
    const data: z.infer<typeof schema> = useJSON(event);
    const client = serverSupabaseServiceRole(event);
    let chain = client
        .from("versions")
        .select("created_at,version,assets!inner(*)")
        .eq("package_id", parseInt(data.pkgId!))
        .order("created_at", {
            ascending: false,
        });

    return chain.limit(20);
})({
    maxAge: 10 * 60,
    getKey: (e) => e,
});
export default api;
