import type { EventHandlerResponse, H3Event, EventHandler, EventHandlerRequest } from "h3";

/** 用于标记函数返回的类型，无实际用途 */
export interface WrappedEventHandler<Input = unknown, Response extends EventHandlerResponse = EventHandlerResponse>
    extends EventHandler<EventHandlerRequest, Promise<{} | undefined>> {}

export interface ComposeEventHandler<
    /** 入参，给前端自动生成 */
    Input = unknown,
    /** 出参，给前端自动生成 */
    Response extends EventHandlerResponse = EventHandlerResponse,
    Request extends EventHandlerRequest = EventHandlerRequest
> {
    (event: H3Event<Request>): Response;
}

export type EndPoint<T, D> = (
    ...args: [...ComposeEventHandler<T, unknown>[], ComposeEventHandler<T, D>]
) => WrappedEventHandler<T, D>;

/** 简单实现 compose，并不需要 next 函数来支持 */
export const defineCompose = <T, D>(
    ...args: [...ComposeEventHandler<T, unknown>[], ComposeEventHandler<T, D>]
): WrappedEventHandler<T, D> => {
    return defineEventHandler(async (event) => {
        for (const handler of args) {
            const result = await handler(event);
            if (result) {
                return result;
            }
        }
    });
};

export const defineCachedCompose = <T, D>(
    ...args: [...ComposeEventHandler<T, unknown>[], ComposeEventHandler<T, D>]
) => {
    return (opts: Parameters<typeof defineCachedEventHandler>[1]): WrappedEventHandler<T, D> =>
        /** @ts-ignore */
        defineCachedEventHandler(async (event) => {
            for (const handler of args) {
                const result = await handler(event);
                if (result) {
                    return result;
                }
            }
        }, opts);
};
