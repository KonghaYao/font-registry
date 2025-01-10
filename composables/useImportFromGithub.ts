import { useAsyncJSON } from "./useAsyncAction";

export const useImportFromGithub = () => {
    const request = useAsyncJSON<{ name: string; repo: string }, { code: 0 }>(
        (data) => {
            return {
                url: "/api/import-from-github",
                method: "post",
                body: data,
            };
        },
        {
            onSuccess: (data) => {
                console.log(data);
            },
        }
    );

    return request;
};
