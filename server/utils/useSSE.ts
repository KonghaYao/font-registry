import type { H3Event } from "h3";
import { ComposeEventHandler } from "./compose";
import { H3Error } from "h3";
/**
 * 获取 SSE 流
 */
export const useSSE = (
    event: H3Event<Request>
): ReturnType<typeof createEventStream> & {
    pushJSON: (data: any) => Promise<void>;
    log: (message: string) => Promise<void>;
} => {
    const sse = event.context.sse;
    sse.pushJSON = (data: any) => {
        return sse.push(JSON.stringify(data));
    };
    sse.log = (message: string) => {
        return sse.push(message);
    };
    return sse;
};

/**
 * 创建一个 SSE 流
 * @example
 * export default defineCompose(
 *   authRunner,
 *   validateJSON(schema),
 *   sseResponse(async (event) => {
 *       const sse = useSSE(event);
 *       sse.push("hello")
 *   })
 * }
 */
export const sseResponse = (fn: ComposeEventHandler) => async (event: H3Event<Request>) => {
    const sse = createEventStream(event);
    event.context.sse = sse;
    // 这里不需要保持异步
    fn(event)
        .then((res: any) => {
            if (res instanceof H3Error) {
                return sse.push({
                    event: "Error",
                    data: JSON.stringify(res.toJSON()),
                });
            }
            return sse.push({
                event: "End",
                data: JSON.stringify(res),
            });
        })
        .catch((e: Error) => {
            return sse.push({
                event: "Error",
                data: e.message,
            });
        })
        .finally(async () => {
            await sse.close();
        });
    return sse.send();
};
