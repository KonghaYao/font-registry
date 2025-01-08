export interface AsyncState<Input, Output> {
    data: Output | null;
    error: Error | null;
    loading: boolean;
    refetch: (input: Input | null) => Promise<void>;
}
export function useAsyncAction<Input, Output>(
    fn: (input: Input) => Promise<Output>
) {
    const refetch = async function (
        this: AsyncState<Input, Output>,
        input: Input
    ) {
        this.loading = true;

        try {
            const response = await fn(input);
            this.data = response;
        } catch (err) {
            this.error = err as Error;
        } finally {
            this.loading = false;
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
    fn: (input: Input) => { url: string; method?: "get" | "post"; body?: Input }
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
    });
}
