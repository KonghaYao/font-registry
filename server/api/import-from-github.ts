import { serverSupabaseUser } from "#supabase/server";
import z from "zod";

export const schema = z.object({
    name: z.string(),
    repo: z.string(),
});

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user)
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    const params = await readValidatedBody(event, schema.safeParse);
    console.log(params);
    return params;
});
