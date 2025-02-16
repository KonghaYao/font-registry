import z from "zod";
import { defineCachedCompose } from "../../utils/compose";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseServiceRole } from "#supabase/server";
import { H3Event } from "h3";
export const schema = z.object({
    pkgId: z.string(),
});

export const getVersionFromPackage = defineCachedFunction(
    async (event: H3Event, pkgId: string) => {
        const client = serverSupabaseServiceRole(event);
        let chain = client
            .from("versions")
            .select("created_at,version,assets!assets_package_id_fkey(*)")
            .eq("package_id", parseInt(pkgId))
            .order("created_at", {
                ascending: false,
            });

        return chain.limit(20);
    },
    {
        maxAge: 10 * 60,
        getKey: (event: H3Event) => {
            return encodeKey(event.node.req.url);
        },
    }
);

const api = defineCompose(validateQuery(schema), async (event) => {
    const data: z.infer<typeof schema> = useJSON(event);
    return getVersionFromPackage(event, data.pkgId);
});
export default api;
