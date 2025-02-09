export const useAI = <Input>(path: string, input: Input, cb: (data: ChatCompletionChunk) => void) => {
    const action = useAsyncSSEJSON<Input, void, ChatCompletionChunk>(
        (input) => {
            return {
                url: `/api/ai/${path}?stream=true`,
                method: "post",
                body: input,
            };
        },
        {
            onReceive(data, input) {
                cb(data);
            },
        }
    );
    return action.fetch(input);
};

// 转成类型
interface ChatCompletionChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    system_fingerprint: string | null;
    choices: Array<{
        index: number;
        delta: {
            role: string;
            content: string;
        };
        finish_reason: string | null;
        logprobs: any;
    }>;
    usage: any;
}
