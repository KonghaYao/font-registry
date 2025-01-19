import { useAsyncJSON } from "./useAsyncAction";

export const usePreBuildFont = () => {
    const request = useAsyncJSON<{ name: string }, { code: 0 }>(
        (data) => {
            return {
                url: "/api/prebuild-font",
                method: "post",
                body: data,
            };
        },
        {
            onSuccess: (data, input) => {
                ElMessage.success(`${input.name} 导入成功`);
            },
            onError(err, input) {
                console.error(err);
                ElMessage.error(`${err.message} ${input.name} 导入失败`);
            },
        }
    );

    return request;
};
