export interface AsyncState<Input, Output> {
    data: Output | null;
    error: Error | null;
    loading: boolean;
    refetch: (input: Input | null) => Promise<void>;
}
export interface AsyncEvent<Input, Output, Message = Output> {
    onError?: (err: Error, input: Input) => void;
    onSuccess?: (data: Output, input: Input) => void;
    /** sse 才能实现 */
    onReceive?: (data: Message, input: Input) => void;
    cache?: () => RequestInit["cache"];
}

export type ActionType = Awaited<ReturnType<typeof useAsyncAction>>;

export function useAsyncAction<Input, Output, Message>(
    fn: (input: Input) => Promise<Output>,
    events?: AsyncEvent<Input, Output, Message>
) {
    const refetch = async function (input: Input) {
        /** @ts-ignore */
        const that = this as AsyncState<Input, Output>;
        that.loading = true;

        try {
            const response = await fn(input);
            that.data = response;
            events?.onSuccess?.(response, input);
        } catch (err) {
            that.error = err as Error;
            events?.onError?.(err as Error, input);
            console.error(err);
        } finally {
            that.loading = false;
        }
    };
    return reactive({
        data: null as Output | null,
        error: null as Error | null,
        loading: false,
        refetch,
        fetch: refetch,
    });
}
export interface RequestType<Input> {
    url: string;
    method?: "get" | "post";
    body?: Input;
    clearNullKey?: boolean;
}
export function useAsyncJSON<Input, Output, Message = Output>(
    fn: (input: Input) => RequestType<Input> | Promise<RequestType<Input>>,
    events?: AsyncEvent<Input, Output, Message>
) {
    events = events || {};
    events.onError =
        events.onError ||
        ((err) => {
            /** @ts-ignore */
            if (err.response) {
                /** @ts-ignore */
                const response: Response = err.response;
                /** @ts-ignore */
                return ElMessage.error(response._data.message || response._data.statusMessage);
            }
            ElMessage.error("请求失败: " + err.message);
        });
    return useAsyncAction<Input, Output, Message>(async (input) => {
        const data = await fn(input);
        data.body = data.body ?? input;
        data.method = data.method ?? "get";
        if (data.clearNullKey && data.body) {
            /** @ts-ignore */
            data.body = removeNulls(data.body);
        }

        return $fetch(data.url, {
            method: data.method,
            headers: {
                "Content-Type": data.method === "post" ? "application/json" : "",
            },
            cache: events?.cache?.(),
            params: data.method === "get" ? (data.body as any) : undefined,
            body: data.method === "post" ? JSON.stringify(data.body) : undefined,
            server: false,
            lazy: true,
        });
    }, events);
}
export type SSEActionType<Message> = ActionType & {
    message: Message | undefined;
    messageStack: Message[];
};
export function useAsyncSSEJSON<Input, Output, Message>(
    fn: (input: Input) => {
        url: string;
        method?: "get" | "post";
        headers?: Record<string, string>;
        body?: Input;
    },
    events?: AsyncEvent<Input, Output, Message>
): SSEActionType<Message> {
    const action: any = useAsyncAction<Input, Output, Message>(async (input) => {
        const data = fn(input);
        data.method = data.method ?? "get";
        if (data.method === "get") {
            const qs = new URLSearchParams(Object.entries(data.body as any));
            data.url += "?" + qs.toString();
        }
        action.message = "";
        action.messageStack = [];
        return new Promise<Output>(async (res, rej) => {
            const { fetchEventSource } = await import("@ai-zen/node-fetch-event-source");
            fetchEventSource(data.url, {
                method: data.method,
                headers: {
                    ...(data.headers ?? {}),
                    "Content-Type": data.method === "post" ? "application/json" : "",
                },
                openWhenHidden: true,
                async onopen(response) {
                    if (response.ok) {
                        return; // everything's good
                    } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                        // client-side errors are usually non-retriable:
                        throw new Error(`Client-side error: ${response.status}`);
                    } else {
                        throw new Error(`Server-side error: ${response.status}`);
                    }
                },
                onmessage(msg) {
                    // if the server emits an error message, throw an exception
                    // so it gets handled by the onerror callback below:
                    if (msg.event === "Error") {
                        rej(new Error(msg.data));
                        return;
                    }
                    if (msg.event === "End") {
                        const finalData = JSON.parse(msg.data);
                        res(finalData);
                        events?.onSuccess?.(finalData, input);
                        return;
                    }
                    console.log(msg.data);
                    if (msg.data === "[DONE]") {
                        res(null as any);
                        events?.onSuccess?.(null as any, input);
                        return;
                    }
                    const message = JSON.parse(msg.data) as Message;
                    action.message = message;
                    action.messageStack.unshift(message);
                    events?.onReceive?.(message, input);
                },
                onerror(err) {
                    rej(err);
                },
                body: data.method === "post" ? JSON.stringify(data.body) : undefined,
            }).catch((err) => {
                rej(err);
            });
        });
    }, events);
    return action as SSEActionType<Message>;
}
