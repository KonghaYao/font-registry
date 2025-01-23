import type { EventHandlerResponse, H3Event, EventHandlerRequest } from "h3";

export interface ComposeEventHandler<
    Request extends EventHandlerRequest = EventHandlerRequest,
    Response extends EventHandlerResponse = EventHandlerResponse
> {
    (event: H3Event<Request>): Response;
}
/** 简单实现 compose，并不需要 next 函数来支持 */
export const defineCompose = <T extends EventHandlerRequest, D>(
    ...args: [...ComposeEventHandler<T, unknown>[], ComposeEventHandler<T, D>]
) => {
    return defineEventHandler<T>(async (event) => {
        for (const handler of args) {
            const result = await handler(event);
            if (result) {
                return result;
            }
        }
    });
};

export const defineCachedCompose = <T extends EventHandlerRequest, D>(
    ...args: [...ComposeEventHandler<T, unknown>[], ComposeEventHandler<T, D>]
) => {
    return (opts: Parameters<typeof defineCachedEventHandler<T>>[1]) =>
        defineCachedEventHandler<T>(async (event) => {
            for (const handler of args) {
                const result = await handler(event);
                if (result) {
                    return result;
                }
            }
        }, opts);
};
