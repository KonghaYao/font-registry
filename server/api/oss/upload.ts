import z from "zod";
import { defineCompose } from "../../utils/compose";
import { sha256 } from "ohash";
// import { validateQuery } from "../../utils/validation";
export const schema = z.object({});

// 下载 zip 内的文件
const api = defineCompose(authLayer, async (event) => {
    const data = await readFormData(event);

    const file = data.get("file") as File;
    const name = data.get("name") as string;
    const sha = sha256(await file.text());
    return {
        status: "success",
        message: "File uploaded successfully.",
        fileUrl: useRuntimeConfig().NUXT_WEBSITE_URL + `/api/oss/download/${sha}/${name}`,
        fileId: sha,
        fileSize: file.size,
    };
});
export default api;
