export interface AsyncState<Input, Output> {
    data: Output | null;
    error: Error | null;
    loading: boolean;
    refetch: (input: Input | null) => Promise<void>;
}
export interface AsyncEvent<Input, Output> {
    onError?: (err: Error, input: Input) => void;
    onSuccess?: (data: Output, input: Input) => void;
}
export function useAsyncAction<Input, Output>(
    fn: (input: Input) => Promise<Output>,
    events?: AsyncEvent<Input, Output>
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

export function useAsyncJSON<Input, Output>(
    fn: (input: Input) => {
        url: string;
        method?: "get" | "post";
        body?: Input;
    },
    events?: AsyncEvent<Input, Output>
) {
    return useAsyncAction<Input, Output>(async (input) => {
        const data = fn(input);
        data.method = data.method ?? "get";

        return $fetch(data.url, {
            method: data.method,
            headers: {
                "Content-Type":
                    data.method === "post" ? "application/json" : "",
            },
            params: data.method === "get" ? (data.body as any) : undefined,
            body:
                data.method === "post" ? JSON.stringify(data.body) : undefined,
            server: false,
            lazy: true,
        });
    }, events);
}
