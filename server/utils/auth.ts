import { serverSupabaseUser } from "#supabase/server";
import { ComposeEventHandler } from "./compose";
import type { H3Event } from "h3";
import { AuthorizationError } from "./Errors";

/** 权限验证中间件 **/
export const authLayer: ComposeEventHandler = async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) throw new AuthorizationError();
    event.context.user = user;
};

/** 获取用户 */
export const useUser = (event: H3Event<Request>): Awaited<ReturnType<typeof serverSupabaseUser>> => {
    return event.context.user;
};
