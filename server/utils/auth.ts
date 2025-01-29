import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { ComposeEventHandler } from "./compose";
import type { H3Event } from "h3";
import { AuthorizationError } from "./Errors";
import { Database } from "~/types/database.types";

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

export const useRole = defineCachedFunction(
    async (event: H3Event<Request>, user_id: string) => {
        const client = await serverSupabaseClient(event);
        const { data } = useSupabaseQuery(await client.from("user_roles").select("*").eq("user_id", user_id));
        return data.map((i) => {
            return i.role;
        });
    },
    {
        maxAge: 60 * 60 * 12,
        getKey(event, user_id) {
            return user_id;
        },
    }
);

export const usePermissions = defineCachedFunction(
    async (event: H3Event<Request>, user_id: string) => {
        const roles = await useRole(event, user_id);
        const client = await serverSupabaseClient(event);
        const { data: permissions } = useSupabaseQuery(
            await client.from("role_permissions").select("*").in("role", roles)
        );
        return permissions.map((i) => i.permission);
    },
    {
        maxAge: 60 * 60 * 12,
        getKey(event, user_id) {
            return user_id;
        },
    }
);

export const hasPermissionLayer =
    (permissions: Database["public"]["Enums"]["app_permission"][]): ComposeEventHandler =>
    async (e) => {
        const user = useUser(e)!;
        const data = await usePermissions(e, user.id);
        if (permissions.every((i) => data.includes(i))) {
            return;
        } else {
            throw new AuthorizationError();
        }
    };

export const hasRoleLayer =
    (roles: Database["public"]["Enums"]["app_role"][]): ComposeEventHandler =>
    async (e) => {
        const user = useUser(e)!;
        const data = await useRole(e, user.id);
        if (roles.every((i) => data.includes(i))) {
            return;
        } else {
            throw new AuthorizationError();
        }
    };
