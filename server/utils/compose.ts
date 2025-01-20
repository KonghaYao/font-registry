import type { EventHandlerResponse, H3Event, EventHandlerRequest } from "h3";

export interface ComposeEventHandler<
    Request extends EventHandlerRequest = EventHandlerRequest,
    Response extends EventHandlerResponse = EventHandlerResponse
> {
    (event: H3Event<Request>): Response;
}
export const defineCompose = <T extends EventHandlerRequest, D>(...args: ComposeEventHandler<T, D>[]) => {
    return defineEventHandler<T>(async (event) => {
        for (const handler of args) {
            const result = await handler(event);
            if (result) {
                return result;
            }
        }
    });
};
