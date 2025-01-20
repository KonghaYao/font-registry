import { z } from "zod";
import { ComposeEventHandler } from "./compose";
import type { H3Event } from "h3";

/** 验证 JSON 入参正确 **/
export const validateJSON =
    <T extends z.ZodTypeAny>(schema: T): ComposeEventHandler =>
    async (event) => {
        const body = await readValidatedBody(event, schema.safeParse);
        if (!body.data) {
            return createError({
                statusCode: 400,
                statusMessage: "Invalid body",
            });
        }
        event.context.json = body.data!;
    };
/** 验证 Query 入参正确 **/
export const validateQuery =
    <T extends z.ZodTypeAny>(schema: T): ComposeEventHandler =>
    async (event) => {
        const body = await getValidatedQuery(event, schema.safeParse);
        if (!body.data) {
            return createError({
                statusCode: 400,
                statusMessage: "Invalid query params",
            });
        }
        event.context.json = body.data!;
    };

/** 获取用户 */
export const useJSON = <T>(event: H3Event<Request>): T => {
    return event.context.json;
};
