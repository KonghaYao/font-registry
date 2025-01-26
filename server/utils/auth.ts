import { serverSupabaseUser } from "#supabase/server";
import { ComposeEventHandler } from "./compose";
import type { H3Event } from "h3";

/** 权限验证中间件 **/
export const authLayer: ComposeEventHandler = async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user)
        return createError({
            statusCode: 400,
            statusMessage: "ID should be an integer",
        });
    event.context.user = user;
};

/** 获取用户 */
export const useUser = (event: H3Event<Request>): Awaited<ReturnType<typeof serverSupabaseUser>> => {
    return event.context.user;
};
