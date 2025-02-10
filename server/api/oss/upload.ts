import { defineCompose } from "../../utils/compose";
import { sha256 } from "~/server/utils/sha256";
import { s3Client } from "../../utils/s3Client";

// 下载 zip 内的文件
const api = defineCompose(authLayer, async (event) => {
    const data = await readFormData(event);

    const file = data.get("file") as File;
    const name = data.get("name") as string;
    const binary = new Uint8Array(await file.arrayBuffer());
    const sha = await sha256(binary);

    await s3Client.putObject("chinese-fonts", `origin/${sha}/${name}`, Buffer.from(binary));
    return {
        status: "success",
        message: "File uploaded successfully.",
        fileUrl: useRuntimeConfig().NUXT_WEBSITE_URL + `/api/oss/download/${sha}/${name}`,
        fileId: sha,
        fileSize: file.size,
    };
});
export default api;
