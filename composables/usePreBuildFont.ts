import { useAsyncJSON } from "./useAsyncAction";

export const usePreBuildFont = () => {
    const request = useAsyncJSON<{ name: string; repo: string }, { code: 0 }>(
        (data) => {
            return {
                url: "/api/prebuild-font",
                method: "post",
                body: data,
            };
        },
        {
            onSuccess: (data, input) => {
                ElMessage.success(`${input.name}/${input.repo} 导入成功`);
            },
            onError(err, input) {
                console.error(err);
                ElMessage.error(
                    `${err.message} ${input.name}/${input.repo} 导入失败`
                );
            },
        }
    );

    return request;
};
