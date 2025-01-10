export interface AsyncState<Input, Output> {
    data: Output | null;
    error: Error | null;
    loading: boolean;
    refetch: (input: Input | null) => Promise<void>;
}
export interface AsyncEvent<Output> {
    onError?: (err: Error) => void;
    onSuccess?: (data: Output) => void;
}
export function useAsyncAction<Input, Output>(
    fn: (input: Input) => Promise<Output>,
    events?: AsyncEvent<Output>
) {
    const refetch = async function (input: Input) {
        /** @ts-ignore */
        const that = this as AsyncState<Input, Output>;
        that.loading = true;

        try {
            const response = await fn(input);
            that.data = response;
            events?.onSuccess?.(response);
        } catch (err) {
            that.error = err as Error;
            events?.onError?.(err as Error);
        } finally {
            that.loading = false;
        }
    };
    return reactive({
        data: null as Output | null,
        error: null as Error | null,
        loading: false,
        refetch: refetch,
    });
}

export function useAsyncJSON<Input, Output>(
    fn: (input: Input) => {
        url: string;
        method?: "get" | "post";
        body?: Input;
    },
    events?: AsyncEvent<Output>
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
