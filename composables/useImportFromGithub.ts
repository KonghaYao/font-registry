import type { InputSchema } from "~/server/api/import-from-github";
import { useAsyncJSON } from "./useAsyncAction";

export const useImportFromGithub = () => {
    const request = useAsyncSSEJSON<InputSchema, { code: 0 }, string>(
        (data) => {
            return {
                url: "/api/import-from-github",
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
                ElMessage.error(`${err.message} ${input.name}/${input.repo} 导入失败`);
            },
        }
    );

    return request;
};
